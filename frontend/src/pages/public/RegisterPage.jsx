import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Sprout, UserPlus, Crosshair, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const JOS_SOUTH_VILLAGES = [
  'Vom',
  'Bukuru',
  'Du',
  'Gyel',
  'Tudun Wada',
  'Zawan',
  'Kwata',
  'Shen',
  'Kuru'
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const { registerFarmer } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    village: 'Vom',
    farmSize: 2.0,
    soilType: 'Loamy Acidic Highland',
    cropsGrown: ['potato', 'tomato'],
    locationGps: null
  });

  const [submitting, setSubmitting] = useState(false);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error('Browser geolocation not supported.');
      return;
    }
    toast.loading('Detecting farm GPS...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lon: parseFloat(pos.coords.longitude.toFixed(4))
        };
        setForm(prev => ({ ...prev, locationGps: coords }));
        toast.success(`Detected GPS: ${coords.lat}, ${coords.lon}`, { id: 'gps' });
      },
      () => {
        toast.info('Using standard Jos South coordinates.', { id: 'gps' });
        setForm(prev => ({ ...prev, locationGps: { lat: 9.7333, lon: 8.7833 } }));
      }
    );
  };

  const handleCropToggle = (crop) => {
    const current = form.cropsGrown || [];
    if (current.includes(crop)) {
      if (current.length === 1) return;
      setForm({ ...form, cropsGrown: current.filter(c => c !== crop) });
    } else {
      setForm({ ...form, cropsGrown: [...current, crop] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerFarmer(form);
      navigate('/home');
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Register Your Farm
        </h1>
        <p className="text-xs text-stone-500">
          Join smallholders in Jos South using deep learning to boost potato & tomato yields
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md space-y-4">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Bitrus Gyang"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="farmer@agriyield.ng"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 pr-10 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0803 123 4567"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Village in Jos South
              </label>
              <select
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {JOS_SOUTH_VILLAGES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Farm size and soil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Farm Size (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={form.farmSize}
                onChange={(e) => setForm({ ...form, farmSize: parseFloat(e.target.value) || 0.5 })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Dominant Soil Type
              </label>
              <select
                value={form.soilType}
                onChange={(e) => setForm({ ...form, soilType: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
              >
                <option value="Loamy Acidic Highland">Loamy Acidic Highland</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
              </select>
            </div>
          </div>

          {/* Crops Grown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Target Crops Grown
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCropToggle('potato')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  form.cropsGrown.includes('potato')
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 ${form.cropsGrown.includes('potato') ? 'text-emerald-600' : 'text-stone-300'}`} />
                Irish Potato
              </button>

              <button
                type="button"
                onClick={() => handleCropToggle('tomato')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  form.cropsGrown.includes('tomato')
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 ${form.cropsGrown.includes('tomato') ? 'text-emerald-600' : 'text-stone-300'}`} />
                Tomato
              </button>
            </div>
          </div>

          {/* GPS Detector button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDetectGps}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {form.locationGps ? `GPS: ${form.locationGps.lat}, ${form.locationGps.lon}` : 'Detect Farm GPS (Optional)'}
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer touch-target"
          >
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? 'Creating Farm Profile...' : 'Complete Free Registration'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-emerald-700 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>

    </div>
  );
}
