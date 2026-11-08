import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const SpeechContext = createContext(null);

export function SpeechProvider({ children }) {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const activeUtterancesRef = useRef([]);
  const cancelRequestedRef = useRef(false);

  // Initialize SpeechSynthesis and Voice Cache
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const updateVoices = () => {
        try {
          const avail = window.speechSynthesis.getVoices();
          if (avail && avail.length > 0) {
            setVoices(avail);
          }
        } catch (e) {
          console.warn('Voice load error:', e);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      // Stop speech when page unloads
      const handleBeforeUnload = () => {
        window.speechSynthesis.cancel();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  // Stop speech playback completely
  const stop = useCallback(() => {
    cancelRequestedRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterancesRef.current = [];
    setIsSpeaking(false);
    setCurrentText('');
  }, []);

  // Stop playback when language changes so speech never mismatches selected language
  useEffect(() => {
    const handleLangChange = () => {
      stop();
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n, stop]);

  // Clean and split text into manageable sentences
  const chunkText = (text) => {
    if (!text) return [];
    const clean = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Split on sentence ends
    const rawSentences = clean.match(/[^.!?;\n]+[.!?;\n]+/g) || [clean];
    const chunks = [];

    rawSentences.forEach((s) => {
      const trimmed = s.trim();
      if (!trimmed) return;
      if (trimmed.length > 140) {
        // Split on comma or pause
        const parts = trimmed.split(/,\s*/);
        chunks.push(...parts.filter(Boolean));
      } else {
        chunks.push(trimmed);
      }
    });

    return chunks.length > 0 ? chunks : [clean];
  };

  /**
   * Speak arbitrary text or localized object { en: '...', ha: '...' }
   */
  const speak = useCallback((textOrOptions, explicitLang = null) => {
    if (!supported) {
      toast.error('Voice playback is not supported on this browser/device.');
      return;
    }

    // Cancel any previous speech
    stop();
    cancelRequestedRef.current = false;

    const currentLang = explicitLang || i18n.language || 'en';
    let rawText = '';

    if (typeof textOrOptions === 'object' && textOrOptions !== null) {
      rawText = currentLang === 'ha' ? (textOrOptions.ha || textOrOptions.en) : (textOrOptions.en || textOrOptions.ha);
    } else if (typeof textOrOptions === 'string') {
      rawText = textOrOptions;
    }

    if (!rawText || !rawText.trim()) return;

    const chunks = chunkText(rawText);
    if (chunks.length === 0) return;

    // Pick best matching voice
    const availVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    let selectedVoice = null;
    let speechRate = 0.80; // Default clear English rate

    if (currentLang === 'ha') {
      // 1. Direct Hausa voice
      selectedVoice = availVoices.find(v => 
        v.lang.toLowerCase().startsWith('ha') || 
        v.name.toLowerCase().includes('hausa')
      );

      // 2. Nigerian English voice (accent naturally handles regional Nigerian terminology & Hausa phonetics)
      if (!selectedVoice) {
        selectedVoice = availVoices.find(v => 
          v.lang === 'en-NG' || 
          v.name.toLowerCase().includes('nigeria')
        );
      }

      // 3. Natural or British voice fallback
      if (!selectedVoice) {
        selectedVoice = availVoices.find(v => 
          v.lang === 'en-GB' || 
          v.name.toLowerCase().includes('natural')
        );
      }

      // Slower, clearer rate for Hausa so rural farmers can follow without rushing
      speechRate = 0.65;
    } else {
      // English: prefer en-NG or standard en-GB/en-US
      selectedVoice = availVoices.find(v => 
        v.lang === 'en-NG' || 
        v.lang === 'en-GB' || 
        v.lang.startsWith('en')
      );
      speechRate = 0.80;
    }

    setIsSpeaking(true);
    setCurrentText(rawText);

    let currentIndex = 0;

    const speakNext = () => {
      if (cancelRequestedRef.current || currentIndex >= chunks.length) {
        setIsSpeaking(false);
        setCurrentText('');
        return;
      }

      const chunk = chunks[currentIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.lang = currentLang === 'ha' && selectedVoice?.lang?.startsWith('ha') ? 'ha-NG' : (selectedVoice?.lang || (currentLang === 'ha' ? 'en-NG' : 'en-US'));

      utterance.onend = () => {
        if (!cancelRequestedRef.current) {
          currentIndex++;
          speakNext();
        }
      };

      utterance.onerror = (e) => {
        if (!cancelRequestedRef.current) {
          currentIndex++;
          if (currentIndex < chunks.length) {
            speakNext();
          } else {
            setIsSpeaking(false);
            setCurrentText('');
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [supported, voices, i18n.language, stop]);

  return (
    <SpeechContext.Provider value={{
      isSpeaking,
      currentText,
      speak,
      stop,
      supported,
      currentLanguage: i18n.language || 'en'
    }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const ctx = useContext(SpeechContext);
  if (!ctx) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return ctx;
}
