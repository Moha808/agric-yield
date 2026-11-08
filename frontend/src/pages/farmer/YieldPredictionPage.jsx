import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { mlApi } from '../../services/mlApi';
import SpeechButton from '../../components/common/SpeechButton';
import { RatingSection } from '../../components/common/RatingModal';
import { 
  TrendingUp, 
  Sparkles, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Droplets,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function YieldPredictionPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { queuePrediction, saveReportLocally, isOnline } = useOfflineSync();

  const [form, setForm] = useState({
    crop: 'potato',
    farm_size: profile?.farmSize || 2.0,
    temperature: 20.5,
    rainfall: 105.0,
    humidity: 62.0,
    n: 130.0,
    p: 90.0,
    k: 170.0,
    ph: 5.8,
    soil_moisture: 55.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Auto-fetch village weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const w = await mlApi.fetchWeather(profile?.village || 'Bukuru');
        if (w) {
          setForm(prev => ({
            ...prev,
            temperature: w.temperature || prev.temperature,
            humidity: w.humidity || prev.humidity,
            rainfall: w.rainfall_recent_mm || prev.rainfall
          }));
        }
      } catch {}
    };
    fetchWeather();
  }, [profile?.village]);

  // Autofill from IoT sensor
  const handleAutofillSensor = async () => {
    try {
      const resp = await mlApi.fetchSensors(profile?.uid);
      const latest = resp.readings?.[resp.readings.length - 1];
      if (latest) {
        setForm(prev => ({
          ...prev,
          soil_moisture: latest.soil_moisture || prev.soil_moisture,
          temperature: latest.air_temp || prev.temperature,
          humidity: latest.humidity || prev.humidity
        }));
        toast.success('Updated weather and soil moisture from sensor!');
      }
    } catch {
      toast.error('Sensor connection unavailable.');
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await mlApi.predictYield(form);
      setResult(res);

      const report = {
        id: `yield_${Date.now()}`,
        farmerId: profile?.uid,
        farmerName: profile?.fullName || 'Farmer',
        timestamp: new Date().toISOString(),
        type: 'yield',
        crop: form.crop,
        inputData: form,
        result: res,
        isSynced: isOnline
      };

      if (isOnline) {
        saveReportLocally(report);
      } else {
        queuePrediction(report);
      }
    } catch (err) {
      toast.error('Yield forecasting failed.');
    } finally {
      setLoading(false);
    }
  };

  const speechText = result
    ? {
        en: `Predicted yield is ${result.yield_kg_per_acre} kilograms per acre, totaling approximately ${result.total_expected_yield_kg} kilograms. Assessment: ${result.interpretation}.`,
        ha: `Hasashen yawan girbi: Za a iya girbin kilo ${result.yield_kg_per_acre} a kowace eka, jimillar kilo ${result.total_expected_yield_kg}. Matsayin amfani: ${result.hausa_interpretation || result.interpretation}.`
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900">{t('card_yield_title')}</h1>
            <p className="text-xs text-stone-500">BiLSTM Time-Series Agronomic Forecast (kg/acre & kg/ha)</p>
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
      <form onSubmit={handlePredict} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
        
        {/* Crop Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2">
            Target Crop in Jos South
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, crop: 'potato' })}
              className={`p-3 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 touch-target transition-all cursor-pointer ${
                form.crop === 'potato'
                  ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t('crop_potato')}
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, crop: 'tomato' })}
              className={`p-3 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 touch-target transition-all cursor-pointer ${
                form.crop === 'tomato'
                  ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t('crop_tomato')}
            </button>
          </div>
        </div>

        {/* Farm Size & Soil Moisture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('farm_size_acres')}
            </label>
            <input
              type="number"
              step="0.1"
              value={form.farm_size}
              onChange={(e) => setForm({ ...form, farm_size: parseFloat(e.target.value) || 0.1 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              min="0.1"
              max="500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Soil Moisture % (from sensor or observation)
            </label>
            <input
              type="number"
              value={form.soil_moisture}
              onChange={(e) => setForm({ ...form, soil_moisture: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              min="10"
              max="100"
              required
            />
          </div>
        </div>

        {/* Weather & Soil chemistry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              Nitrogen (N)
            </label>
            <input
              type="number"
              value={form.n}
              onChange={(e) => setForm({ ...form, n: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              Potassium (K)
            </label>
            <input
              type="number"
              value={form.k}
              onChange={(e) => setForm({ ...form, k: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              Soil pH
            </label>
            <input
              type="number"
              step="0.1"
              value={form.ph}
              onChange={(e) => setForm({ ...form, ph: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              Rainfall (mm)
            </label>
            <input
              type="number"
              value={form.rainfall}
              onChange={(e) => setForm({ ...form, rainfall: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target cursor-pointer"
        >
          {loading ? 'Forecasting Yield with BiLSTM Model...' : 'Calculate Predicted Harvest Yield'}
        </button>
      </form>

      {/* Yield Result Display */}
      {result && (
        <div className="bg-white p-6 rounded-3xl border-2 border-teal-500 shadow-md space-y-5 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-black text-stone-900">
                Harvest Yield Forecast
              </h3>
            </div>
            <SpeechButton text={speechText} />
          </div>

          {/* Metric Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-black uppercase text-teal-800">
                Yield per Acre
              </span>
              <p className="text-2xl sm:text-3xl font-black text-teal-950 mt-1">
                {result.yield_kg_per_acre?.toLocaleString()} <span className="text-xs font-bold">kg</span>
              </p>
              <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                (~{Math.round(result.yield_kg_per_acre / 50)} bags of 50kg)
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-black uppercase text-stone-600">
                Total Farm Harvest ({form.farm_size} acres)
              </span>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                {result.total_expected_yield_kg?.toLocaleString()} <span className="text-xs font-bold">kg</span>
              </p>
              <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                {result.yield_kg_per_hectare?.toLocaleString()} kg / hectare
              </p>
            </div>

            <div className={`rounded-2xl p-4 text-center border ${
              result.level === 'above'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : (result.level === 'below' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-blue-50 border-blue-300 text-blue-950')
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider">
                Benchmark Status
              </span>
              <p className="text-base font-black mt-1">
                {result.interpretation}
              </p>
              <p className="text-[11px] italic mt-0.5 opacity-90">
                {result.hausa_interpretation}
              </p>
            </div>
          </div>

          {/* Actionable Agronomic Improvement Tips */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-stone-800">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Recommended Farm Steps to Secure/Boost This Yield</span>
            </div>
            
            <ul className="space-y-2 text-xs text-stone-700">
              {result.tips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-100">
                  <span className="text-teal-700 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource Optimization Advice: Irrigation & Fertilization Schedule */}
          <div className="p-4 rounded-2xl bg-teal-950 text-teal-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-teal-300">
              <Droplets className="w-4 h-4" />
              <span>Smart Resource & Irrigation Optimization Advice</span>
            </div>
            <p className="text-xs leading-relaxed">
              Based on {form.soil_moisture}% soil moisture and Jos South highland temperatures ({form.temperature}°C):
              {form.soil_moisture < 45
                ? ' Irrigate 20-25mm early tomorrow morning. Moisture stress now will stunt tuber bulking / blossom set.'
                : ' Soil moisture is adequate. No immediate watering required; next cycle recommended in 48 hours.'}
            </p>
          </div>

          <RatingSection onSaveRating={() => toast.success('Yield feedback recorded.')} />
        </div>
      )}

    </div>
  );
}
