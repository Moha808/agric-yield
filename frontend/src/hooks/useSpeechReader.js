import { useSpeech } from '../context/SpeechContext';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

const PAGE_SCRIPTS = {
  '/': {
    en: "Welcome to AgriYield AI. Enhancing agricultural yield with machine learning for Irish Potato and Tomato smallholders in Jos South, Plateau State. Access leaf disease detection, crop suitability matching, fertilizer recommendations, and harvest yield forecasting.",
    ha: "Barka da zuwa AgriYield AI. Kayan aikin noma mai hikima don manoman Dankalin Turawa da Tumatur a Jos South, Jihar Filato. Kuna iya binciken cututtukan ganye, dacewar shuka, lissafin taki, da hasashen yawan girbi."
  },
  '/home': {
    en: "Farmer Dashboard. View live weather for your village in Jos South and choose a decision tool: Leaf Disease Scan, Crop Match, Fertilizer Advisory, Harvest Forecast, or Sensor Telemetry.",
    ha: "Cibiyar Manomi. Duba yanayin garinku na yau a Jos South, sannan ka zabi aikin da kake so: Gano cutar ganye, zabin shuka, shawaran taki, hasashen girbi, ko bayanan na'urar gona."
  },
  '/disease-detection': {
    en: "Leaf Disease Detection. Take a photo or upload an image of a potato or tomato leaf. The AI model detects Early Blight, Late Blight, Bacterial Spot, and Healthy leaves, providing organic and chemical remedies.",
    ha: "Gano Cututtukan Shuka. Dauki hoto ko dora hoton ganyen dankali ko tumatur. Fasahar AI zata gano cuta kamar Late Blight ko Early Blight nan take tare da magungunan gargajiya da na zamani."
  },
  '/crop-recommendation': {
    en: "Crop Suitability Match. Enter your soil Nitrogen, Phosphorus, Potassium, and pH to calculate suitability scores for Irish Potato and Tomato cultivation in Jos South.",
    ha: "Zabin Amfanin Gona. Shigar da sinadaran kasarka kamar Nitrogen, Phosphorus, Potassium, da pH. Tsarin zai lissafa dacewar Dankali da Tumatur a filin nomanka."
  },
  '/fertilizer': {
    en: "Fertilizer Advisory. Enter your measured soil test values. The nutrient engine calculates exact 50kg bags of NPK 15-15-15 and supplemental Urea needed per acre.",
    ha: "Shawaran Taki. Shigar da sakamakon gwajin kasarka. Tsarin zai lissafa ainihin buhunan takin NPK da Urea da kake bukata a kowace eka."
  },
  '/yield-prediction': {
    en: "Harvest Yield Forecasting. Predict expected potato and tomato harvest in kilograms and 50 kilogram bags based on your farm acreage and soil fertility.",
    ha: "Hasashen Yawan Girbi. Shigar da girman gonarka da sinadaran kasa don sanin adadin buhunan da zaka girba."
  },
  '/sensors': {
    en: "IoT Soil Telemetry. Track live volumetric soil moisture, soil temperature, and automated irrigation recommendations from field probes.",
    ha: "Bayanan Na'urar Gona. Kula da danshin kasa da sanyin kasa kai tsaye, tare da shawarar ko ya kamata a shayar da gona yanzu."
  },
  '/reports': {
    en: "Diagnostic Reports. Review your farm history of blight scans and soil assessments, and download printable PDF advisory reports.",
    ha: "Rahotannin Bincike. Duba tarihin binciken gonarka da saukar da cikakken rahoton PDF don duba lokacin da babu intanet."
  },
  '/about': {
    en: "About AgriYield AI. Designed specifically for smallholders in Jos South, Plateau State, Nigeria, calibrated for highland volcanic soils and cool microclimates.",
    ha: "Game da AgriYield AI. An kera wannan manhaja musamman don manoman Jos South, Jihar Filato, domin inganta noman dankali da tumatur."
  },
  '/contact': {
    en: "Contact Extension Support. Reach agricultural experts, report field disease outbreaks, or ask questions.",
    ha: "Tuntube Mu. Tuntubi kwararrun jami'an gona, ba da rahoton barkewar cutar ganye a yankinku, ko neman karin bayani."
  },
  '/help': {
    en: "Farmer Help Guide. Learn how to photograph diseased leaves, interpret soil nutrient test numbers, and use audio playback.",
    ha: "Taimakon Manomi. Koyi yadda zaka dauki hoton ganye da kyau, fahimtar sinadaran kasa, da sauraron bayani da murya."
  }
};

export function useSpeechReader() {
  const { speak, stop, isSpeaking, supported, currentLanguage } = useSpeech();
  const { i18n } = useTranslation();

  const readCurrentPage = useCallback((explicitLang = null) => {
    const lang = explicitLang || i18n.language || 'en';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    // Look for exact match or clean route prefix
    const script = PAGE_SCRIPTS[path] || PAGE_SCRIPTS['/'];
    const textToSpeak = lang === 'ha' ? script.ha : script.en;

    speak(textToSpeak, lang);
  }, [speak, i18n.language]);

  return {
    speak,
    readCurrentPage,
    stop,
    isSpeaking,
    supported,
    currentLanguage
  };
}
