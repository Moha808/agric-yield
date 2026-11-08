import React from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpeechReader } from '../../hooks/useSpeechReader';

export default function SpeechButton({ 
  text = null, 
  hausaText = null,
  className = '', 
  label = null, 
  readPage = false 
}) {
  const { t, i18n } = useTranslation();
  const { speak, readCurrentPage, stop, isSpeaking, supported, currentLanguage } = useSpeechReader();

  if (!supported) return null;

  const isHausa = (currentLanguage || i18n.language) === 'ha';

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      if (readPage || (!text && !hausaText)) {
        readCurrentPage(i18n.language);
      } else {
        // If an explicit hausaText is provided and language is 'ha', use it!
        const payload = {
          en: typeof text === 'object' && text !== null ? text.en : text,
          ha: hausaText || (typeof text === 'object' && text !== null ? text.ha : text)
        };
        speak(payload, i18n.language);
      }
    }
  };

  const defaultPlayText = isHausa ? 'Saurara' : 'Listen';
  const defaultStopText = isHausa ? 'Dakata' : 'Stop Audio';
  const buttonText = label ? (isSpeaking ? (isHausa ? 'Dakata' : 'Stop') : label) : (isSpeaking ? defaultStopText : defaultPlayText);

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs touch-target cursor-pointer select-none ${
        isSpeaking 
          ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400' 
          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
      } ${className}`}
      title={isSpeaking ? (isHausa ? 'Dakata da karatu' : 'Stop audio playback') : (isHausa ? 'Saurari bayani' : 'Listen to audio guide')}
      aria-label={isSpeaking ? 'Stop audio' : 'Listen to audio'}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{buttonText}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
