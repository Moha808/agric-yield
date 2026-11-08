import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export function useSpeechReader() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const activeUtterancesRef = useRef([]);

  // Load and cache voices properly across Chrome, Edge, Safari, Firefox
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      activeUtterancesRef.current = [];
      setIsSpeaking(false);
    }
  }, []);

  // Split text into natural chunks (sentences) so the browser never cuts off long text
  const chunkText = (text) => {
    // Clean markdown/symbols
    const clean = text
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Split on sentence terminators
    const rawSentences = clean.match(/[^.!?;\n]+[.!?;\n]+/g) || [clean];
    const chunks = [];

    rawSentences.forEach((s) => {
      const trimmed = s.trim();
      if (!trimmed) return;
      if (trimmed.length > 150) {
        // Further split on commas or clauses if sentence is long
        const sub = trimmed.split(/,\s*/);
        chunks.push(...sub.filter(Boolean));
      } else {
        chunks.push(trimmed);
      }
    });

    return chunks.length > 0 ? chunks : [clean];
  };

  const speak = useCallback((text, targetLang = 'en') => {
    if (!supported || !text) {
      toast.error('Voice playback is not supported on this device.');
      return;
    }

    // Stop existing speech
    stop();

    const chunks = chunkText(text);
    if (chunks.length === 0) return;

    // Pick best matching voice
    const availVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    let selectedVoice = null;
    let speechRate = 0.82; // Clear, measured pace

    if (targetLang === 'ha') {
      // 1. Direct Hausa voice if available
      selectedVoice = availVoices.find(v => 
        v.lang.toLowerCase().startsWith('ha') || 
        v.name.toLowerCase().includes('hausa')
      );

      // 2. Nigerian English / West African voice (pronounces regional phonetics significantly better)
      if (!selectedVoice) {
        selectedVoice = availVoices.find(v => 
          v.lang === 'en-NG' || 
          v.name.toLowerCase().includes('nigeria')
        );
      }

      // 3. Fallback to clear British or standard natural voice
      if (!selectedVoice) {
        selectedVoice = availVoices.find(v => 
          v.lang === 'en-GB' || 
          v.name.toLowerCase().includes('natural')
        );
      }

      // Slower rate for Hausa articulation so words are never rushed
      speechRate = 0.74;
    } else {
      // English: Prefer Nigerian English or clear natural voice
      selectedVoice = availVoices.find(v => 
        v.lang === 'en-NG' || 
        v.lang === 'en-GB' || 
        v.lang.startsWith('en')
      );
      speechRate = 0.82;
    }

    setIsSpeaking(true);
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const chunk = chunks[currentIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.lang = targetLang === 'ha' && selectedVoice?.lang?.startsWith('ha') ? 'ha-NG' : (selectedVoice?.lang || 'en-US');

      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };

      utterance.onerror = (e) => {
        console.warn('Speech chunk error:', e);
        currentIndex++;
        if (currentIndex < chunks.length) {
          speakNext();
        } else {
          setIsSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [supported, voices, stop]);

  // Extract clean readable text from the current page
  const readCurrentPage = useCallback((lang = 'en') => {
    // Target main page content area
    const container = document.querySelector('main') || document.body;
    if (!container) return;

    // Collect headings, labels, cards, summaries, ignoring nav, footer, scripts
    const textNodes = [];
    const elements = container.querySelectorAll('h1, h2, h3, p, label, .speech-content');
    
    elements.forEach(el => {
      // Skip hidden, navbar or footer elements
      if (el.closest('header') || el.closest('footer') || el.closest('nav') || el.classList.contains('no-speech')) {
        return;
      }
      const t = el.innerText?.trim();
      if (t && t.length > 2 && !textNodes.includes(t)) {
        textNodes.push(t);
      }
    });

    if (textNodes.length === 0) {
      toast('No readable text found on this page.', { icon: 'ℹ️' });
      return;
    }

    // Limit to first ~600 words for responsive page summary
    const pageScript = textNodes.slice(0, 15).join('. ');
    speak(pageScript, lang);
  }, [speak]);

  return {
    speak,
    readCurrentPage,
    stop,
    isSpeaking,
    supported
  };
}
