import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpeechButton from '../../components/common/SpeechButton';
import { 
  Sprout, 
  Camera, 
  TrendingUp, 
  FlaskConical, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  WifiOff,
  Volume2,
  MapPin,
  CheckCircle,
  BarChart3,
  HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const heroSpeech = "AgriYield AI. Enhancing agricultural yield with machine learning for Irish Potato and Tomato smallholder farmers in Jos South, Plateau State, Nigeria. Access leaf disease detection, crop suitability matching, fertilizer recommendations, and harvest yield forecasting.";

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section with Upscaled Image & High-Contrast Typography */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4">
        <div 
          className="relative min-h-[560px] sm:min-h-[620px] rounded-3xl overflow-hidden bg-cover bg-center flex items-center shadow-lg border border-stone-200/50"
          style={{ backgroundImage: `url('/landing-hero.jpg')` }}
        >
          {/* Enhanced Multi-stop Contrast Gradient for 100% Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/85 to-stone-950/65 sm:to-stone-900/50"></div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl px-5 py-10 sm:px-12 sm:py-16 text-white space-y-6">
            
            {/* Location & Crop Scope Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Jos South, Plateau State • Irish Potato & Tomato</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-1.15">
              Precision Farming Decision Support for Smallholders
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-medium">
              Engineered specifically for farmers across Vom, Bukuru, Du, Gyel, and Zawan. 
              Diagnose leaf blights from a smartphone camera, match soil fertility, optimize fertilizer ratios, and predict harvest yield—designed to function seamlessly offline in the field.
            </p>

            {/* Audio Voice Guidance Control */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="text-[11px] sm:text-xs font-bold bg-white/10 text-emerald-200 border border-white/15 px-3 py-1.5 rounded-xl">
                Hausa & English Audio
              </div>
              <SpeechButton 
                text={heroSpeech} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-transparent text-xs" 
                label="Listen to Introduction"
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to={user ? "/home" : "/register"}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all touch-target cursor-pointer"
              >
                <span>{user ? "Open Farmer Dashboard" : "Register Farm Free"}</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </Link>

              <Link
                to="/about"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3.5 rounded-xl border border-white/25 transition-colors flex items-center justify-center touch-target cursor-pointer"
              >
                About the System
              </Link>
            </div>

            {/* Field Assurance Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-stone-200 font-semibold border-t border-white/15">
              <span className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Offline-First PWA</span>
              </span>
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Audio Playback</span>
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Calibrated for Jos South</span>
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 5 Core Decision Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Five Core Agricultural Decision Tools
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Integrated machine learning models calibrated for Solanaceae crops and Highland agro-ecology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Tool 1: Leaf Disease Diagnosis */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-stone-900">
                Leaf Disease Diagnosis
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Snap a photo of an Irish Potato or Tomato leaf. The deep convolutional network instantly detects Early Blight, Late Blight, Bacterial Spot, Septoria, and Healthy foliage, providing immediate organic and chemical interventions.
              </p>
            </div>
            <Link 
              to="/disease-detection" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-3 border-t border-stone-100"
            >
              <span>Launch Disease Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tool 2: Crop Suitability Matching */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-stone-900">
                Crop Suitability Match
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Evaluates soil Nitrogen, Phosphorus, Potassium, pH, rainfall, and highland temperatures to calculate precise suitability scores for Potato versus Tomato cultivation on your specific farmland.
              </p>
            </div>
            <Link 
              to="/crop-recommendation" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-3 border-t border-stone-100"
            >
              <span>Evaluate Crop Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tool 3: Fertilizer Planning */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-stone-900">
                Fertilizer Advisory
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Compares existing soil NPK values against the exact biological requirements of potato and tomato crops. Accurately determines nutrient deficits and specifies practical NPK 15-15-15 or Urea dosages.
              </p>
            </div>
            <Link 
              to="/fertilizer" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-3 border-t border-stone-100"
            >
              <span>Calculate Fertilizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tool 4: Harvest Yield Prediction */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-stone-900">
                Harvest Yield Forecasting
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Predicts harvest yield in kilograms and tons per acre based on farm acreage, soil fertility, and microclimate parameters, enabling smallholders to plan logistics, storage, and market sales.
              </p>
            </div>
            <Link 
              to="/yield-prediction" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-3 border-t border-stone-100"
            >
              <span>Forecast Yield</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tool 5: IoT Telemetry & Diagnostic Reports */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shadow-xs">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-stone-900">
                IoT Telemetry & PDF Diagnostic Reports
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Live sensor ingestion for soil moisture, soil temperature, and air metrics from ESP32/Arduino field nodes. Every disease diagnosis and crop assessment generates a full PDF advisory report saved locally for offline review.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100">
              <Link to="/sensors" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <span>View Telemetry Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/reports" className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1">
                <span>Access Saved Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Field Workflow Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-md">
          
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Field Operation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              How AgriYield AI Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Step 01</span>
              <h3 className="font-extrabold text-sm text-white">Capture or Input Data</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Take a photo of a sick leaf directly in the browser or enter your field's soil test values. Telemetry nodes can also post readings automatically.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Step 02</span>
              <h3 className="font-extrabold text-sm text-white">Machine Learning Analysis</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                PyTorch and scikit-learn models evaluate the inputs against Jos South agro-ecological benchmarks and live weather conditions.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Step 03</span>
              <h3 className="font-extrabold text-sm text-white">Actionable Field Advisory</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Receive specific organic/chemical treatments, listen to the recommendations read aloud in Hausa or English, and download PDF reports.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Jos South Agro-Ecological Focus Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Plateau Highland Calibration</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Tailored for Jos South Smallholders
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Jos South's unique altitude (1,280 meters above sea level) gives it cooler temperatures ideal for Irish Potato and Tomato, but high humidity increases Late Blight risk. AgriYield AI algorithms are built specifically for these highland soil and climate conditions.
            </p>
          </div>

          <Link
            to="/register"
            className="shrink-0 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-5 py-3 rounded-xl shadow-xs transition-colors"
          >
            Create Farmer Account
          </Link>
        </div>
      </section>

    </div>
  );
}
