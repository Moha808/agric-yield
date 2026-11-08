import React, { useState, useEffect } from 'react';
import { CloudRain, Droplets, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mlApi } from '../../services/mlApi';

export default function WeatherCard({ village = 'Bukuru' }) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await mlApi.fetchWeather(village);
      setWeather(data);
    } catch (err) {
      setError(true);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [village]);

  return (
    <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-stone-300 text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{weather?.village || village}, Jos South</span>
        </div>
        <button 
          onClick={loadWeather} 
          disabled={loading}
          className="text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          title="Refresh weather"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-2 flex items-center gap-2 text-xs text-stone-400">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Checking live weather for {village}...</span>
        </div>
      ) : error || !weather ? (
        <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-300 bg-stone-800/60 p-3 rounded-xl border border-stone-700/60">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Live weather feed unavailable (OpenWeatherMap API key required).</span>
          </div>
          <button 
            onClick={loadWeather} 
            className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {weather.temperature != null ? weather.temperature : '--'}°
              </span>
              <span className="text-stone-400 text-sm font-semibold">C</span>
            </div>
            <p className="text-xs text-stone-300 font-medium mt-0.5">
              {weather.description || 'Plateau Highland'}
            </p>
          </div>

          {/* Climate Metrics */}
          <div className="flex items-center gap-3 bg-stone-800 rounded-xl px-3 py-2 border border-stone-700 text-xs">
            <div className="flex items-center gap-1.5 text-stone-300">
              <Droplets className="w-3.5 h-3.5 text-emerald-400" />
              <span>{weather.humidity != null ? `${weather.humidity}%` : '--'}</span>
            </div>
            <div className="w-px h-4 bg-stone-700"></div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>{weather.rainfall_recent_mm != null ? `${weather.rainfall_recent_mm} mm` : '--'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
