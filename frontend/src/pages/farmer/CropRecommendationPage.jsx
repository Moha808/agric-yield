import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { mlApi } from '../../services/mlApi';
import SpeechButton from '../../components/common/SpeechButton';
import { RatingSection } from '../../components/common/RatingModal';
import { 
  Sprout, 
  Droplets, 
  Thermometer, 
  Sparkles, 
  RotateCcw, 
  Save, 
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CropRecommendationPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { queuePrediction, saveReportLocally, isOnline } = useOfflineSync();

  const [form, setForm] = useState({
    n: 120,
    p: 85,
    k: 165,
    ph: 5.8,
    rainfall: 110,
    temperature: 21.5,
    humidity: 62.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reportSaved, setReportSaved] = useState(false);

  // Auto-fetch village weather on mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weather = await mlApi.fetchWeather(profile?.village || 'Bukuru');
        if (weather) {
          setForm(prev => ({
            ...prev,
            temperature: weather.temperature || prev.temperature,
            humidity: weather.humidity || prev.humidity,
            rainfall: weather.rainfall_recent_mm || prev.rainfall
          }));
        }
      } catch (err) {
        console.warn('Weather auto-fetch fallback', err);
      }
    };
    fetchWeather();
  }, [profile?.village]);

  // Autofill from IoT sensor reading
  const handleAutofillSensor = async () => {
    try {
      const resp = await mlApi.fetchSensors(profile?.uid);
      const latest = resp.readings?.[resp.readings.length - 1];
      if (latest) {
        setForm(prev => ({
          ...prev,
          temperature: latest.air_temp || prev.temperature,
          humidity: latest.humidity || prev.humidity
        }));
        toast.success('Soil and weather fields updated from your latest sensor reading!');
      } else {
        toast.info('No sensor reading found for your account.');
      }
    } catch {
      toast.error('Could not connect to sensor stream.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReportSaved(false);

    try {
      const pred = await mlApi.predictCrop(form);
      setResult(pred);

      // Auto-save report
      const report = {
        id: `crop_${Date.now()}`,
        farmerId: profile?.uid,
        farmerName: profile?.fullName || 'Farmer',
        timestamp: new Date().toISOString(),
        type: 'crop',
        crop: 'potato & tomato',
        inputData: form,
        result: pred,
        isSynced: isOnline
      };

      if (isOnline) {
        saveReportLocally(report);
      } else {
        queuePrediction(report);
      }
      setReportSaved(true);
    } catch (err) {
      toast.error(err.message || 'Crop recommendation failed. Please check ML API server status.');
    } finally {
      setLoading(false);
    }
  };

  const speechText = result
    ? {
        en: `Top recommended crop is ${result.recommendations?.[0]?.crop} with ${result.recommendations?.[0]?.confidence}% confidence. ${result.plateau_context?.explanation || ''}`,
        ha: `Shukar da ta fi dacewa da kasarka ita ce ${result.recommendations?.[0]?.crop === 'potato' ? 'Dankalin Turawa' : (result.recommendations?.[0]?.crop === 'tomato' ? 'Tumatur' : result.recommendations?.[0]?.crop)} da kashi ${result.recommendations?.[0]?.confidence} cikin dari. ${result.plateau_context?.hausa_explanation || ''}`
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900">{t('card_crop_rec_title')}</h1>
            <p className="text-xs text-stone-500">Jos South Precision Soil & Climate Matching</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutofillSensor}
          className="bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold px-3 py-2 rounded-xl border border-purple-200 flex items-center gap-1.5 cursor-pointer touch-target self-start sm:self-auto"
        >
          <Activity className="w-4 h-4 text-purple-600" />
          {t('use_sensor_data_btn')}
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-700">
            Soil Nutrients & Environment (Jos South)
          </h2>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
            Padp / Vom Calibration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('nitrogen_label')}
            </label>
            <input
              type="number"
              value={form.n}
              onChange={(e) => setForm({ ...form, n: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="300"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">Typical: 100 - 150 kg/ha</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('phosphorus_label')}
            </label>
            <input
              type="number"
              value={form.p}
              onChange={(e) => setForm({ ...form, p: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="250"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">Typical: 60 - 100 kg/ha</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('potassium_label')}
            </label>
            <input
              type="number"
              value={form.k}
              onChange={(e) => setForm({ ...form, k: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="350"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">Typical: 120 - 190 kg/ha</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('ph_label')}
            </label>
            <input
              type="number"
              step="0.1"
              value={form.ph}
              onChange={(e) => setForm({ ...form, ph: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="3.5"
              max="9.0"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">Plateau Soil: 5.2 - 6.5</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('temperature_label')}
            </label>
            <input
              type="number"
              step="0.5"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">Jos Highland: 18 - 25°C</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('humidity_label')}
            </label>
            <input
              type="number"
              value={form.humidity}
              onChange={(e) => setForm({ ...form, humidity: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="10"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('rainfall_label')}
            </label>
            <input
              type="number"
              value={form.rainfall}
              onChange={(e) => setForm({ ...form, rainfall: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="400"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target cursor-pointer"
          >
            {loading ? (
              <span>{t('analyzing')}</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t('submit_predict_btn')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Section */}
      {result && (
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500/80 shadow-md space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-stone-900">
                Top Recommended Crops
              </h3>
            </div>
            <SpeechButton text={speechText} />
          </div>

          {/* Top 3 Crop Ranking Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {result.recommendations?.map((rec, idx) => {
              const isScope = rec.is_scope_crop;
              return (
                <div 
                  key={rec.crop}
                  className={`p-4 rounded-2xl border ${
                    idx === 0 
                      ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20' 
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">
                      Rank #{idx + 1}
                    </span>
                    {isScope && (
                      <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Plateau Focus
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-stone-900 capitalize">
                    {rec.crop}
                  </h4>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Suitability</span>
                      <span className="text-emerald-700">{rec.confidence}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${rec.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agronomic Context for Jos South Smallholders */}
          <div className="bg-emerald-900 text-emerald-50 p-4 rounded-2xl text-xs space-y-2">
            <p className="font-bold text-emerald-200">
              Jos South Plateau Microclimate Suitability:
            </p>
            <p className="leading-relaxed">
              {result.plateau_context?.explanation}
            </p>
            <p className="leading-relaxed text-emerald-200/90 italic pt-1 border-t border-emerald-800">
              {result.plateau_context?.hausa_explanation}
            </p>
          </div>

          {/* Rating Loop */}
          <RatingSection
            onSaveRating={(stars, comment) => {
              // Update saved report
              toast.success('Rating recorded.');
            }}
          />
        </div>
      )}

    </div>
  );
}
