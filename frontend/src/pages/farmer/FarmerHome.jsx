import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import WeatherCard from '../../components/common/WeatherCard';
import SpeechButton from '../../components/common/SpeechButton';
import { 
  Sprout, 
  Camera, 
  FlaskConical, 
  TrendingUp, 
  FileText, 
  Activity, 
  HelpCircle,
  WifiOff,
  ChevronRight
} from 'lucide-react';

export default function FarmerHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { isOnline } = useOfflineSync();

  const farmerVillage = profile?.village || 'Bukuru';

  const features = [
    {
      to: '/crop-recommendation',
      title: t('card_crop_rec_title'),
      desc: t('card_crop_rec_desc'),
      icon: Sprout,
      color: 'bg-emerald-700',
      tag: 'Soil & Climate'
    },
    {
      to: '/disease-detection',
      title: t('card_disease_title'),
      desc: t('card_disease_desc'),
      icon: Camera,
      color: 'bg-red-700',
      tag: 'Leaf Photo Diagnosis'
    },
    {
      to: '/fertilizer',
      title: t('card_fertilizer_title'),
      desc: t('card_fertilizer_desc'),
      icon: FlaskConical,
      color: 'bg-amber-700',
      tag: 'NPK Balance'
    },
    {
      to: '/yield-prediction',
      title: t('card_yield_title'),
      desc: t('card_yield_desc'),
      icon: TrendingUp,
      color: 'bg-teal-700',
      tag: 'Harvest Forecast'
    },
    {
      to: '/reports',
      title: t('card_reports_title'),
      desc: t('card_reports_desc'),
      icon: FileText,
      color: 'bg-blue-700',
      tag: 'PDF Archives'
    },
    {
      to: '/sensors',
      title: t('card_sensors_title'),
      desc: t('card_sensors_desc'),
      icon: Activity,
      color: 'bg-purple-700',
      tag: 'Field Telemetry'
    },
    {
      to: '/help',
      title: t('card_help_title'),
      desc: t('card_help_desc'),
      icon: HelpCircle,
      color: 'bg-stone-700',
      tag: 'Advisory Guide'
    }
  ];

  const welcomeText = {
    en: `Welcome, ${profile?.fullName || 'Farmer'}. This is your AgriYield AI decision dashboard for Irish Potato and Tomato farming in ${farmerVillage}, Jos South.`,
    ha: `Barka da zuwa, ${profile?.fullName || 'Manomi'}. Wannan ita ce cibiyar AgriYield AI ta taimakon manoman Dankalin Turawa da Tumatur a ${farmerVillage}, Jos South.`
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Offline Notice Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-amber-900">
          <WifiOff className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Offline Mode Active.</span> All your diagnostic predictions, reports, and soil checks will be safely recorded on your phone and synced once you connect.
          </div>
        </div>
      )}

      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            Welcome, {profile?.fullName || 'Farmer'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Village: <span className="font-bold text-stone-700">{farmerVillage}</span>, Jos South • Crops: <span className="font-bold text-stone-700">Irish Potato & Tomato</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SpeechButton text={welcomeText} />
        </div>
      </div>

      {/* Village Weather Card */}
      <WeatherCard village={farmerVillage} />

      {/* Main Grid: Big Farmer Action Cards */}
      <div>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>Decision Tools</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-emerald-600 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Open Tool</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help Line Summary */}
      <div className="bg-stone-100 rounded-2xl p-5 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-stone-900 text-sm">Need Extension Officer Assistance?</h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Visit the NRCRI station in Vom or contact your Plateau Agricultural Development Programme (PADP) extension agent.
          </p>
        </div>
        <Link
          to="/help"
          className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          View Field Guidelines
        </Link>
      </div>

    </div>
  );
}
