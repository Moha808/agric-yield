import React from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpeechReader } from '../../hooks/useSpeechReader';

export default function SpeechButton({ 
  text = null, 
  className = '', 
  label = null, 
  readPage = false 
}) {
  const { t, i18n } = useTranslation();
  const { speak, readCurrentPage, stop, isSpeaking, supported } = useSpeechReader();

  if (!supported) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      if (readPage || !text) {
        readCurrentPage(i18n.language);
      } else {
        speak(text, i18n.language);
      }
    }
  };

  const buttonText = label || (isSpeaking ? t('stop_speech') : t('read_aloud'));

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs touch-target cursor-pointer select-none ${
        isSpeaking 
          ? 'bg-amber-600 text-white animate-pulse ring-2 ring-amber-400' 
          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
      } ${className}`}
      title={isSpeaking ? t('stop_speech') : (readPage ? 'Read this page aloud' : t('read_aloud'))}
      aria-label={isSpeaking ? t('stop_speech') : t('read_aloud')}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 shrink-0" />
          <span>{label ? 'Stop Audio' : t('stop_speech')}</span>
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
