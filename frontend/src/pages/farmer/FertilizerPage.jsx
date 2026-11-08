import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { mlApi } from '../../services/mlApi';
import SpeechButton from '../../components/common/SpeechButton';
import { RatingSection } from '../../components/common/RatingModal';
import { 
  FlaskConical, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FertilizerPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { queuePrediction, saveReportLocally, isOnline } = useOfflineSync();

  const [crop, setCrop] = useState('potato');
  const [n, setN] = useState(75);
  const [p, setP] = useState(85);
  const [k, setK] = useState(160);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await mlApi.predictFertilizer({ crop, n, p, k });
      setResult(res);

      const report = {
        id: `fert_${Date.now()}`,
        farmerId: profile?.uid,
        farmerName: profile?.fullName || 'Farmer',
        timestamp: new Date().toISOString(),
        type: 'fertilizer',
        crop,
        inputData: { crop, n, p, k },
        result: res,
        isSynced: isOnline
      };

      if (isOnline) {
        saveReportLocally(report);
      } else {
        queuePrediction(report);
      }
    } catch (err) {
      toast.error('Fertilizer evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const speechText = result
    ? {
        en: `${result.title}. Recommendation: ${result.action}`,
        ha: `Sakamakon binciken taki: ${result.hausa_action || result.action}`
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-stone-900">{t('card_fertilizer_title')}</h1>
          <p className="text-xs text-stone-500">Precision Soil Nutrient Balance & Organic/Mineral Advisory</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handlePredict} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
        
        {/* Crop Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2">
            Target Crop in Jos South
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCrop('potato')}
              className={`p-3 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 touch-target transition-all cursor-pointer ${
                crop === 'potato'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t('crop_potato')}
            </button>
            <button
              type="button"
              onClick={() => setCrop('tomato')}
              className={`p-3 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 touch-target transition-all cursor-pointer ${
                crop === 'tomato'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t('crop_tomato')}
            </button>
          </div>
        </div>

        {/* NPK Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('nitrogen_label')}
            </label>
            <input
              type="number"
              value={n}
              onChange={(e) => setN(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="400"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Ideal for {crop}: {crop === 'potato' ? '130' : '115'} kg/ha
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('phosphorus_label')}
            </label>
            <input
              type="number"
              value={p}
              onChange={(e) => setP(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="300"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Ideal for {crop}: {crop === 'potato' ? '90' : '70'} kg/ha
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('potassium_label')}
            </label>
            <input
              type="number"
              value={k}
              onChange={(e) => setK(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0"
              max="450"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Ideal for {crop}: {crop === 'potato' ? '170' : '120'} kg/ha
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target cursor-pointer"
        >
          {loading ? 'Evaluating Nutrient Gaps...' : 'Get Precision Fertilizer Advice'}
        </button>
      </form>

      {/* Result Section */}
      {result && (
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-500/80 shadow-md space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-stone-900">
                Nutrient Diagnostic Result
              </h3>
            </div>
            <SpeechButton text={speechText} />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Priority: {result.priority_nutrient}
                </span>
                <h4 className="text-lg font-black text-amber-950 mt-1.5">
                  {result.title}
                </h4>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <h5 className="text-xs font-black uppercase text-emerald-900 mb-1">
                Recommended Farmer Action
              </h5>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {result.action}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
              <h5 className="text-xs font-black uppercase text-teal-900 mb-1">
                Shawarar da Harshen Hausa
              </h5>
              <p className="text-xs text-teal-800 leading-relaxed font-medium">
                {result.hausa_action}
              </p>
            </div>
          </div>

          {/* NPK Comparison Bars */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h5 className="text-xs font-black uppercase text-stone-700">
              Nutrient Comparison (Current vs Target)
            </h5>
            
            {['N', 'P', 'K'].map((nut) => {
              const cur = result.current?.[nut] || 0;
              const ideal = result.ideal?.[nut] || 1;
              const pct = Math.min(100, Math.round((cur / ideal) * 100));
              return (
                <div key={nut}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{nut === 'N' ? 'Nitrogen' : nut === 'P' ? 'Phosphorus' : 'Potassium'} ({nut})</span>
                    <span>{cur} / {ideal} kg/ha ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct < 80 ? 'bg-amber-500' : (pct > 125 ? 'bg-red-500' : 'bg-emerald-500')
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <RatingSection onSaveRating={() => toast.success('Feedback saved.')} />
        </div>
      )}

    </div>
  );
}
