import React from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import { useSpeech } from '../../context/SpeechContext';

export default function AudioFloatingPlayer() {
  const { isSpeaking, stop, currentLanguage } = useSpeech();

  if (!isSpeaking) return null;

  const isHausa = currentLanguage === 'ha';

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-md animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-stone-900/95 text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl border-2 border-emerald-500 backdrop-blur-md flex items-center gap-3 w-full">
        
        {/* Pulsing Voice Indicator */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-left">
            <p className="text-[11px] font-black text-emerald-300 uppercase tracking-wider">
              {isHausa ? "Muryar Hausa na Karatu" : "Audio Guide Playing"}
            </p>
            <p className="text-[10px] text-stone-400">
              {isHausa ? "Gudu: 0.65x (a hankali)" : "Pace: 0.80x"}
            </p>
          </div>
        </div>

        {/* Big Stop Button */}
        <button
          onClick={stop}
          type="button"
          className="ml-auto bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer touch-target select-none"
          title={isHausa ? "Dakata da Karatu" : "Stop Audio Playback"}
          aria-label="Stop Audio"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>{isHausa ? "Dakata" : "Stop"}</span>
        </button>

      </div>
    </div>
  );
}
