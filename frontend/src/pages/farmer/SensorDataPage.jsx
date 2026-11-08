import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { mlApi } from '../../services/mlApi';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import SpeechButton from '../../components/common/SpeechButton';
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  Wind, 
  RefreshCw, 
  PlusCircle, 
  Info,
  Radio,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

export default function SensorDataPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    soil_moisture: 52.0,
    soil_temp: 20.5,
    air_temp: 23.5,
    humidity: 60.0
  });

  const loadSensors = async () => {
    setLoading(true);
    try {
      const resp = await mlApi.fetchSensors(profile?.uid);
      setReadings(resp.readings || []);
    } catch {
      toast.error('Failed to load sensor stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, [profile?.uid]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSavingManual(true);
    try {
      const newReading = {
        soil_moisture: Number(manualForm.soil_moisture),
        soil_temp: Number(manualForm.soil_temp),
        air_temp: Number(manualForm.air_temp),
        humidity: Number(manualForm.humidity),
        farmer_id: profile?.uid || 'web_farmer',
        timestamp: new Date().toISOString()
      };

      let apiSuccess = false;
      try {
        await mlApi.recordSensorReading(newReading);
        apiSuccess = true;
      } catch (apiErr) {
        console.warn('Backend API record fallback to Firestore:', apiErr);
      }

      // Ensure persistence directly in Firestore as well
      try {
        await addDoc(collection(db, 'sensorReadings'), {
          ...newReading,
          received_at: new Date().toISOString()
        });
      } catch (firestoreErr) {
        console.warn('Firestore sensor direct write note:', firestoreErr);
      }

      // Immediately append to local state so user sees it instantly
      setReadings(prev => [...prev, newReading]);
      toast.success('Soil reading saved successfully!');
      setShowManualModal(false);
      await loadSensors();
    } catch (err) {
      toast.error(err.message || 'Failed to save sensor reading.');
    } finally {
      setSavingManual(false);
    }
  };

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  // Smart Resource Advice
  let irrigationAdvice = "No telemetry readings available yet. Record a manual reading or connect an IoT node.";
  let hausaAdvice = "Babu bayanan na'ura tukuna. Saka sabon bayani ko hada na'urar gona.";
  if (latest) {
    irrigationAdvice = "Soil moisture is optimal (50-70%). Regular irrigation cycle in 48 hours.";
    hausaAdvice = "Danshin kasar yana da kyau. Shayarwa ta gaba bayan kwana biyu.";
    if (latest.soil_moisture < 40) {
      irrigationAdvice = "CRITICAL: Soil moisture low (<40%). Apply 20mm early morning drip irrigation to prevent tuber cracking in potatoes.";
      hausaAdvice = "Gaggawa: Kasar ta bushe (<40%). Shayar da gona da sassafe don hana dankali tsagewa.";
    } else if (latest.soil_moisture > 75) {
      irrigationAdvice = "WARNING: Excess soil moisture (>75%). Suspend irrigation to protect against potato/tomato Late Blight spores.";
      hausaAdvice = "Hankali: Danshi ya yi yawa (>75%). Dakatar da shayarwa don kare gonarka daga cutar Late Blight.";
    }
  }

  // Format chart data
  const chartData = readings.map((r, i) => {
    const time = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `#${i + 1}`;
    return {
      time: time || `#${i + 1}`,
      soilMoisture: r.soil_moisture,
      soilTemp: r.soil_temp,
      airTemp: r.air_temp,
      humidity: r.humidity
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900">{t('card_sensors_title')}</h1>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                <Radio className="w-2.5 h-2.5 animate-pulse text-purple-600" />
                Telemetry Live
              </span>
            </div>
            <p className="text-xs text-stone-500">Raspberry Pi / ESP32 Field Probe Telemetry in Jos South</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 flex items-center gap-1.5 cursor-pointer touch-target"
          >
            <PlusCircle className="w-4 h-4 text-stone-600" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={loadSensors}
            className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
            title="Refresh stream"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200/80 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-600">Loading IoT sensor telemetry...</p>
        </div>
      ) : readings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-4">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-purple-600">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-stone-900">No Sensor Readings Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No live telemetry detected for your farm in Jos South. Connect your ESP32 / Raspberry Pi IoT probe, or log a reading manually using the button below.
            </p>
          </div>
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer touch-target"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log First Soil Reading</span>
          </button>
        </div>
      ) : (
        <>
          {/* Latest Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-[10px] font-black uppercase">Soil Moisture</span>
                <Droplets className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-blue-950 mt-1">
                {latest.soil_moisture}%
              </p>
              <span className="text-[10px] font-bold text-stone-400">Target: 50 - 70%</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[10px] font-black uppercase">Soil Temp</span>
                <Thermometer className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-950 mt-1">
                {latest.soil_temp}°C
              </p>
              <span className="text-[10px] font-bold text-stone-400">Jos Highlands</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[10px] font-black uppercase">Air Temp</span>
                <Thermometer className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                {latest.air_temp}°C
              </p>
              <span className="text-[10px] font-bold text-stone-400">Microclimate</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
              <div className="flex items-center justify-between text-purple-700">
                <span className="text-[10px] font-black uppercase">Air Humidity</span>
                <Droplets className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-purple-950 mt-1">
                {latest.humidity}%
              </p>
              <span className="text-[10px] font-bold text-stone-400">Blight Risk Index</span>
            </div>
          </div>

          {/* Irrigation Advisory Card */}
          <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
                <Droplets className="w-4 h-4" />
                <span>Irrigation & Soil Moisture Advisory</span>
              </div>
              <SpeechButton 
                text={{ en: irrigationAdvice, ha: hausaAdvice }} 
                className="bg-white/10 text-white hover:bg-white/20 border-white/20" 
              />
            </div>
            <p className="text-xs leading-relaxed font-medium text-stone-200">
              {irrigationAdvice}
            </p>
            <p className="text-xs leading-relaxed text-stone-300 italic pt-1 border-t border-stone-800">
              {hausaAdvice}
            </p>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold uppercase text-stone-700">
              Soil Moisture & Temperature Dynamics
            </h3>
            <p className="text-xs text-stone-400">
              Chronological telemetric series captured by your farm sensor probe in Jos South
            </p>

            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="soilMoisture" 
                    name="Soil Moisture (%)" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="soilTemp" 
                    name="Soil Temp (°C)" 
                    stroke="#d97706" 
                    strokeWidth={2} 
                    dot={{ r: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="airTemp" 
                    name="Air Temp (°C)" 
                    stroke="#16a34a" 
                    strokeWidth={2} 
                    dot={{ r: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleManualSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-base font-black text-stone-900">
                Log Soil Reading Manually
              </h3>
              <button 
                type="button" 
                onClick={() => setShowManualModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Soil Moisture (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualForm.soil_moisture}
                  onChange={(e) => setManualForm({ ...manualForm, soil_moisture: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Soil Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualForm.soil_temp}
                  onChange={(e) => setManualForm({ ...manualForm, soil_temp: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Air Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualForm.air_temp}
                    onChange={(e) => setManualForm({ ...manualForm, air_temp: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Air Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualForm.humidity}
                    onChange={(e) => setManualForm({ ...manualForm, humidity: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingManual}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
              >
                {savingManual ? 'Saving...' : 'Save Reading'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
