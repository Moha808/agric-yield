import React from 'react';
import { useTranslation } from 'react-i18next';
import SpeechButton from '../../components/common/SpeechButton';
import { 
  HelpCircle, 
  Phone, 
  Volume2, 
  WifiOff, 
  Leaf, 
  Sprout, 
  FlaskConical, 
  Camera, 
  Activity,
  MapPin
} from 'lucide-react';

export default function HelpPage() {
  const { t, i18n } = useTranslation();

  const instructionsHausa = `Barka da zuwa cibiyar taimakon manoma. Wannan manhaja tana taimaka maka wajen noman dankali da tumatur a Jos South. Don duba cuta, shiga sashen daukar hoto ka dauki hoton ganye a wuri mai haske. Idan babu intanet, manhajar za ta ajiye bayananka a wayarka har sai ka koma kan layi. Don tambayoyi, kira layin jami'an gona na Vom ko Bukuru.`;

  const instructionsEnglish = `Welcome to AgriYield AI Farmer Support. This system assists smallholders in Jos South with precision Irish Potato and Tomato management. To diagnose a disease, capture a well-lit photo of an infected leaf. Even without internet, your predictions are stored locally on your device and will sync automatically when back online.`;

  const speechText = {
    en: instructionsEnglish,
    ha: instructionsHausa
  };

  const faqs = [
    {
      q: "How does offline mode work on my phone?",
      hausa_q: "Yaya aikin manhajar yake idan babu intanet?",
      a: "AgriYield AI uses Progressive Web App (PWA) caching. All pages, your last 30 days of diagnostic reports, and advice work smoothly without an active SIM data connection. When network is restored, pending reports sync automatically.",
      hausa_a: "Manhajar tana aiki ko da babu katin intanet. Dukkan rahotanninka da shawarwari suna nan a wayarka. Da zarar ka shiga intanet za ta tura bayananka da kanta."
    },
    {
      q: "How to capture a clear leaf photo for accurate disease detection?",
      hausa_q: "Yaya zan dauki hoton ganye mai kyau?",
      a: "Stand in natural daylight. Hold the camera steady 15 to 25 cm from a single leaf showing visible spots or wilting. Avoid heavy shadows or motion blur.",
      hausa_a: "Tsaya a inda akwai hasken rana. Rike kyamara a daidai ganye daya mai ciwo. Kada ka girgiza hannunka."
    },
    {
      q: "Where can smallholder farmers in Jos South obtain certified potato seeds?",
      hausa_q: "A ina manoman Jos South za su sami irin dankali mai inganci?",
      a: "Always source certified, disease-free seed tubers from the National Root Crops Research Institute (NRCRI) in Vom or accredited PADP seed outgrowers to prevent Early and Late Blight epidemics.",
      hausa_a: "Koda yaushe ka sayi irin dankali daga cibiyar binciken amfanin gona ta kasa (NRCRI) dake Vom ko jami'an PADP don kaucewa cututtukan barna."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 text-white flex items-center justify-center shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900">{t('card_help_title')}</h1>
            <p className="text-xs text-stone-500">Voice guidance, extension directory & step-by-step instructions</p>
          </div>
        </div>

        <SpeechButton text={speechText} />
      </div>

      {/* Voice Guidance Banner */}
      <div className="bg-emerald-900 text-emerald-50 rounded-3xl p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-300">
          <Volume2 className="w-4 h-4" />
          <span>Audio Voice Guidance (Muryar Jagora)</span>
        </div>
        <p className="text-xs leading-relaxed">
          {i18n.language === 'ha' ? instructionsHausa : instructionsEnglish}
        </p>
      </div>

      {/* Local Extension Directory for Jos South */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-stone-800 flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-600" />
          Plateau State Extension & Emergency Contacts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <h4 className="font-extrabold text-stone-900 text-xs">
              National Root Crops Research Institute (NRCRI)
            </h4>
            <p className="text-[11px] text-stone-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Vom Station, Jos South
            </p>
            <p className="text-xs font-bold text-emerald-700 font-mono mt-1">
              +234 803 589 1234
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <h4 className="font-extrabold text-stone-900 text-xs">
              Plateau Agricultural Development Programme (PADP)
            </h4>
            <p className="text-[11px] text-stone-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Bukuru Extension Office, Jos South
            </p>
            <p className="text-xs font-bold text-emerald-700 font-mono mt-1">
              +234 802 777 9876
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-stone-800">
          Frequently Asked Questions (Tambayoyin Da Aka Saba Yi)
        </h3>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="text-xs font-bold text-stone-900">
                {i18n.language === 'ha' ? f.hausa_q : f.q}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {i18n.language === 'ha' ? f.hausa_a : f.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
