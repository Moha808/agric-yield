import React from 'react';
import { Sprout, MapPin, ShieldCheck, Heart, Cpu, FileCheck } from 'lucide-react';
import SpeechButton from '../../components/common/SpeechButton';

export default function AboutPage() {
  const aboutText = "AgriYield AI is developed to bridge the digital agricultural divide for smallholder farmers in Jos South, Plateau State, Nigeria, specializing in Solanum tuberosum (Irish potato) and Solanum lycopersicum (tomato).";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Agronomic Research Context
            </span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">About AgriYield AI</h1>
          <p className="text-xs text-stone-500">
            Development of a Website for Enhancing Agricultural Yield Using Deep Learning Models
          </p>
        </div>

        <SpeechButton text={aboutText} />
      </div>

      {/* Narrative Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 text-xs text-stone-700 leading-relaxed">
        
        <div>
          <h3 className="text-sm font-black text-stone-900 uppercase mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            The High Plateau Agriculture of Jos South
          </h3>
          <p>
            Jos South Local Government Area (encompassing Vom, Bukuru, Du, Gyel, Tudun Wada, Zawan, Kwata, Shen, and Kuru) sits on a unique highland plateau with an average elevation of 1,200 to 1,300 meters above sea level. This topography provides a temperate microclimate with mean daytime temperatures of 18°C to 25°C—making Jos South the primary hub for Irish Potato and dry-season Tomato cultivation in Nigeria.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black text-stone-900 uppercase mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            The Problem: 20–40% Yield Loss
          </h3>
          <p>
            Despite favorable conditions, smallholder farmers face severe agronomic bottlenecks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Devastating Blight Epidemics:</strong> Late Blight (<em>Phytophthora infestans</em>) spreads rapidly in cool, humid Jos mornings, destroying entire fields in days.</li>
            <li><strong>Imbalanced Fertilizer Application:</strong> Widespread misapplication of Urea or DAP without assessing soil potassium (K) deficiencies leads to low tuber set and blossom end rot.</li>
            <li><strong>No Yield Forecasting:</strong> Farmers lack predictive yield projections to negotiate fair market prices or procure harvesting inputs beforehand.</li>
            <li><strong>Poor Rural Internet:</strong> Many agricultural tools fail in fields due to poor cellular connectivity.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black text-stone-900 uppercase mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-700" />
            The Solution: Deep Learning Decision Support
          </h3>
          <p>
            AgriYield AI provides an end-to-end mobile PWA that functions completely offline:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Edge-Optimized MobileNetV2:</strong> Fast inference on low-cost Android phones in under 3 seconds.</li>
            <li><strong>Random Forest & BiLSTM:</strong> Rigorous crop suitability classification and harvest yield forecasting calibrated against Plateau Agricultural Development Programme (PADP) agronomic benchmarks.</li>
            <li><strong>Dual Language & Voice Guidance:</strong> Complete English and Hausa translation with audio synthesis.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
