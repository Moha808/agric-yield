import React from 'react';
import { Sprout, Heart, ShieldCheck, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Col 1: About Project */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">AgriYield AI</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              Development of a Website for Enhancing Agricultural Yield Using Deep Learning Models.
              Dedicated to smallholder Irish Potato and Tomato farmers across Vom, Bukuru, Du, Gyel, 
              Tudun Wada, Zawan, and surrounding villages in Jos South, Plateau State, Nigeria.
            </p>
            {/* SDG Alignment Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 bg-amber-900/60 text-amber-200 border border-amber-700/50 text-[11px] font-bold px-2.5 py-1 rounded-md">
                SDG 2: Zero Hunger
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 text-[11px] font-bold px-2.5 py-1 rounded-md">
                SDG 13: Climate Action
              </span>
            </div>
          </div>

          {/* Col 2: Research & Advisory Partners */}
          <div>
            <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wider mb-2.5">
              Plateau Extension Partners
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>National Root Crops Research Institute (NRCRI), Vom</li>
              <li>Plateau Agricultural Development Programme (PADP)</li>
              <li>Jos South Farmers Multi-Purpose Cooperative</li>
              <li>Plateau State Ministry of Agriculture</li>
            </ul>
          </div>

          {/* Col 3: Support Hotline */}
          <div>
            <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wider mb-2.5">
              Farmer Help Desk
            </h4>
            <div className="space-y-1 text-xs text-stone-400">
              <p className="font-medium text-stone-200">Extension Advisory Line:</p>
              <p className="text-emerald-400 font-mono">+234 803 000 JOS (567)</p>
              <p className="mt-2 text-[11px] text-stone-500">
                Works 100% offline with locally cached diagnostic records & speech read-aloud guidance.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AgriYield AI. Designed for Smallholder Farmers in Jos South, Plateau State.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Mobile-First PWA • Low-Bandwidth Optimized
          </p>
        </div>
      </div>
    </footer>
  );
}
