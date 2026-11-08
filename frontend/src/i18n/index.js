import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app_title: "AgriYield AI",
      app_subtitle: "Precision Farming for Jos South, Plateau State",
      tagline: "Empowering Potato & Tomato Smallholders with Deep Learning Decisions",
      language: "Language",
      english: "English",
      hausa: "Hausa",
      online: "Online",
      offline: "Offline",
      syncing: "Syncing...",
      unsynced_items: "Unsynced",
      all_synced: "All Synced",
      read_aloud: "Read Aloud",
      stop_speech: "Stop Voice",

      // Navigation
      nav_home: "Home",
      nav_reports: "My Reports",
      nav_sensors: "Sensor Data",
      nav_help: "Help",
      nav_profile: "Profile",
      nav_admin: "Admin",
      nav_login: "Sign In",
      nav_register: "Register",
      nav_logout: "Sign Out",
      nav_about: "About",
      nav_contact: "Contact",

      // Villages
      village_select: "Select Village in Jos South",
      villages: {
        vom: "Vom",
        bukuru: "Bukuru",
        du: "Du",
        gyel: "Gyel",
        tudun_wada: "Tudun Wada",
        zawan: "Zawan",
        kwata: "Kwata",
        shen: "Shen",
        kuru: "Kuru"
      },

      // Home Cards
      card_crop_rec_title: "Crop Recommendation",
      card_crop_rec_desc: "Discover the best crops for your soil chemistry and local Jos South weather.",
      card_disease_title: "Disease Detection",
      card_disease_desc: "Photograph potato or tomato leaves to diagnose blights and get immediate remedies.",
      card_fertilizer_title: "Fertilizer Suggestion",
      card_fertilizer_desc: "Balance soil NPK with precision organic and mineral fertilizer guidance.",
      card_yield_title: "Yield Prediction",
      card_yield_desc: "Forecast your expected harvest in kg per acre using time-series deep learning.",
      card_reports_title: "My Reports",
      card_reports_desc: "Access your diagnosis history, downloadable PDF summaries, and health cards.",
      card_sensors_title: "IoT Sensor Data",
      card_sensors_desc: "Monitor live soil moisture, soil temperature, and smart irrigation schedules.",
      card_help_title: "Farmer Help & Audio",
      card_help_desc: "Listen to audio farming guides, local extension contacts, and emergency assistance.",

      // Weather Card
      weather_title: "Local Weather",
      weather_loading: "Fetching weather...",
      weather_temp: "Temperature",
      weather_humidity: "Humidity",
      weather_rain: "Rainfall Estimate",

      // Crops
      crop_potato: "Irish Potato",
      crop_tomato: "Tomato",
      both_crops: "Potato & Tomato",

      // Common Form Fields
      farm_size_acres: "Farm Size (Acres)",
      nitrogen_label: "Nitrogen (N) kg/ha",
      phosphorus_label: "Phosphorus (P) kg/ha",
      potassium_label: "Potassium (K) kg/ha",
      ph_label: "Soil pH (3.5 - 9.0)",
      rainfall_label: "Rainfall (mm)",
      temperature_label: "Temperature (°C)",
      humidity_label: "Humidity (%)",
      select_crop_label: "Select Crop",
      use_sensor_data_btn: "Autofill from Latest Sensor Reading",
      use_gps_btn: "Detect Farm GPS",
      submit_predict_btn: "Analyze & Predict",
      analyzing: "Analyzing with AI...",

      // Disease Detection
      take_photo_btn: "Take Photo with Camera",
      upload_image_btn: "Upload Leaf Image",
      disease_result_title: "Diagnosis Result",
      severity_label: "Severity",
      confidence_label: "Confidence",
      organic_treatment_title: "Organic / Natural Treatment",
      chemical_treatment_title: "Chemical / Fungicide Treatment",
      prevention_title: "Field Prevention Guidelines",
      retake_photo_prompt: "The leaf photo was blurry or unclear. Please retake a well-lit photo of a single leaf.",
      healthy_status: "Healthy Foliage! No disease pathogens detected.",

      // Feedback
      rate_accuracy: "Rate Prediction Accuracy",
      rate_subtext: "Help improve our Jos South deep learning models",
      comment_placeholder: "Add your feedback or notes from your field...",
      submit_feedback_btn: "Save Feedback",
      feedback_saved: "Thank you! Your feedback has been recorded."
    }
  },
  ha: {
    translation: {
      app_title: "AgriYield AI",
      app_subtitle: "Kayan Aikin Noma Mai Hikima don Jos South, Jihar Filato",
      tagline: "Taimaka wa Manoman Dankali da Tumatur da Fasahar Deep Learning",
      language: "Harshe",
      english: "Turanci",
      hausa: "Hausa",
      online: "A Kan Layi",
      offline: "Babu Intanet",
      syncing: "Ana Aika Bayanai...",
      unsynced_items: "Wadanda ba a tura ba",
      all_synced: "Duk An Tura",
      read_aloud: "Karanta da Murya",
      stop_speech: "Dakata da Murya",

      // Navigation
      nav_home: "Gida",
      nav_reports: "Rahotanni Na",
      nav_sensors: "Bayanan Na'ura",
      nav_help: "Taimako",
      nav_profile: "Bayanai Na",
      nav_admin: "Gudanarwa",
      nav_login: "Shiga",
      nav_register: "Yi Rajista",
      nav_logout: "Fita",
      nav_about: "Game da Mu",
      nav_contact: "Tuntube Mu",

      // Villages
      village_select: "Zabi Kauye a Jos South",
      villages: {
        vom: "Vom",
        bukuru: "Bukuru",
        du: "Du",
        gyel: "Gyel",
        tudun_wada: "Tudun Wada",
        zawan: "Zawan",
        kwata: "Kwata",
        shen: "Shen",
        kuru: "Kuru"
      },

      // Home Cards
      card_crop_rec_title: "Zabin Amfanin Gona",
      card_crop_rec_desc: "Gano amfanin gonar da ya fi dacewa da sinadaran kasarka da yanayin Jos South.",
      card_disease_title: "Gano Cututtukan Shuka",
      card_disease_desc: "Dauki hoton ganyen dankali ko tumatur don gano cuta da hanyoyin magance ta nan take.",
      card_fertilizer_title: "Shawaran Taki",
      card_fertilizer_desc: "Daidaita sinadaran kasa (NPK) tare da ingantattun shawarwarin takin zamani da na gargajiya.",
      card_yield_title: "Hasashen Yawan Amfani",
      card_yield_desc: "San yawan buhunan da za ka girba a kowace eka ta hanyar fasahar Deep Learning.",
      card_reports_title: "Rahotanni Na",
      card_reports_desc: "Duba tarihin bincikenka, saukar da rahoton PDF, da katin lafiyar gona.",
      card_sensors_title: "Bayanan Na'urorin Gona",
      card_sensors_desc: "Kula da danshin kasa, sanyin kasa, da jadawalin shayarwa na musamman.",
      card_help_title: "Taimako da Muryar Manomi",
      card_help_desc: "Saurari bayanan noma da murya, lambobin jami'an gona, da taimakon gaggawa.",

      // Weather Card
      weather_title: "Yanayin Garinku",
      weather_loading: "Ana duba yanayi...",
      weather_temp: "Zafi/Sanyi",
      weather_humidity: "Danshin Iska",
      weather_rain: "Kiyasin Ruwan Sama",

      // Crops
      crop_potato: "Dankalin Turawa",
      crop_tomato: "Tumatur",
      both_crops: "Dankali da Tumatur",

      // Common Form Fields
      farm_size_acres: "Girman Gona (Eka)",
      nitrogen_label: "Sinadarin Nitrogen (N)",
      phosphorus_label: "Sinadarin Phosphorus (P)",
      potassium_label: "Sinadarin Potassium (K)",
      ph_label: "Mizanin Ruwan Kasa (pH)",
      rainfall_label: "Yawan Ruwan Sama (mm)",
      temperature_label: "Yanayin Zafi/Sanyi (°C)",
      humidity_label: "Danshin Iska (%)",
      select_crop_label: "Zabi Shuka",
      use_sensor_data_btn: "Cika Daga Na'urar Gonarka",
      use_gps_btn: "Gano Wurin Gonata (GPS)",
      submit_predict_btn: "Bincika da Fasahar AI",
      analyzing: "Fasahar AI na kan bincike...",

      // Disease Detection
      take_photo_btn: "Dauki Hoto da Kyamara",
      upload_image_btn: "Dora Hoton Ganye",
      disease_result_title: "Sakamakon Binciken Cuta",
      severity_label: "Tsanantar Cuta",
      confidence_label: "Kwarin Gwiwa",
      organic_treatment_title: "Maganin Gargajiya / Na Halitta",
      chemical_treatment_title: "Maganin Fesa na Zamani",
      prevention_title: "Hanyoyin Kariya a Gona",
      retake_photo_prompt: "Hoton bai fito da haske ko kyan gani ba. Da fatan a sake daukar sabon hoto.",
      healthy_status: "Ganye Lafiyayye! Babu wata kwayar cuta a jikinsa.",

      // Feedback
      rate_accuracy: "Yaba Ingancin Sakamako",
      rate_subtext: "Taimaka mana inganta fasahar manoman Jos South",
      comment_placeholder: "Rubuta ra'ayinka ko abin da ka lura a gonarka...",
      submit_feedback_btn: "Aika Ra'ayi",
      feedback_saved: "Mun gode! An karbi ra'ayinka."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
