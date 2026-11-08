import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Sprout, 
  Save, 
  Crosshair, 
  CheckCircle,
  ShieldCheck,
  LogOut
} from 'lucide-react';
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

export default function FarmerProfilePage() {
  const { t } = useTranslation();
  const { profile, updateFarmerProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    village: profile?.village || 'Bukuru',
    farmSize: profile?.farmSize || 2.0,
    soilType: profile?.soilType || 'Loamy Acidic Highland',
    cropsGrown: profile?.cropsGrown || ['potato', 'tomato'],
    locationGps: profile?.locationGps || null
  });

  const [saving, setSaving] = useState(false);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    toast.loading('Detecting farm GPS coordinates...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lon: parseFloat(pos.coords.longitude.toFixed(4))
        };
        setForm(prev => ({ ...prev, locationGps: coords }));
        toast.success(`GPS coordinates detected: ${coords.lat}, ${coords.lon}`, { id: 'gps' });
      },
      (err) => {
        toast.error('Could not obtain GPS. Using Jos South standard coordinates.', { id: 'gps' });
        setForm(prev => ({ ...prev, locationGps: { lat: 9.7941, lon: 8.8640 } }));
      },
      { timeout: 10000 }
    );
  };

  const handleCropToggle = (crop) => {
    const existing = form.cropsGrown || [];
    if (existing.includes(crop)) {
      if (existing.length === 1) {
        toast.error('At least one crop (potato or tomato) must be selected.');
        return;
      }
      setForm({ ...form, cropsGrown: existing.filter(c => c !== crop) });
    } else {
      setForm({ ...form, cropsGrown: [...existing, crop] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFarmerProfile(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-stone-900">{t('nav_profile')}</h1>
          <p className="text-xs text-stone-500">Manage your farm location, soil type, and crops in Jos South</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
        
        {/* Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Village & GPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('village_select')}
            </label>
            <select
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {JOS_SOUTH_VILLAGES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Farm GPS Location
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={form.locationGps ? `${form.locationGps.lat}, ${form.locationGps.lon}` : 'Not set'}
                className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded-xl text-xs font-mono text-stone-600"
              />
              <button
                type="button"
                onClick={handleDetectGps}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-2.5 rounded-xl border border-emerald-300 flex items-center justify-center cursor-pointer shrink-0"
                title="Detect Farm GPS"
              >
                <Crosshair className="w-5 h-5 text-emerald-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Farm Size & Soil Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('farm_size_acres')}
            </label>
            <input
              type="number"
              step="0.1"
              value={form.farmSize}
              onChange={(e) => setForm({ ...form, farmSize: parseFloat(e.target.value) || 0.5 })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              min="0.1"
              max="200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Dominant Soil Type
            </label>
            <select
              value={form.soilType}
              onChange={(e) => setForm({ ...form, soilType: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Loamy Acidic Highland">Loamy Acidic Highland (Plateau standard)</option>
              <option value="Sandy Loam">Sandy Loam</option>
              <option value="Clay Loam">Clay Loam</option>
              <option value="Volcanic Rocky Soil">Volcanic / Mineral-rich Rock Soil</option>
            </select>
          </div>
        </div>

        {/* Crops Grown Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2">
            Crops Grown on Your Land (In Scope)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleCropToggle('potato')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                form.cropsGrown?.includes('potato')
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${form.cropsGrown?.includes('potato') ? 'text-emerald-600' : 'text-stone-300'}`} />
              Irish Potato
            </button>

            <button
              type="button"
              onClick={() => handleCropToggle('tomato')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                form.cropsGrown?.includes('tomato')
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${form.cropsGrown?.includes('tomato') ? 'text-emerald-600' : 'text-stone-300'}`} />
              Tomato
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
        </button>
      </form>

      {/* Account Management & Sign Out */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900">Session & Security</h3>
          <p className="text-xs text-stone-500">Sign out of your session on this device</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-stone-500" />
          <span>Sign Out to Landing Page</span>
        </button>
      </div>

    </div>
  );
}
