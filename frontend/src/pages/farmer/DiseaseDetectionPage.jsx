import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { mlApi } from '../../services/mlApi';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import SpeechButton from '../../components/common/SpeechButton';
import { RatingSection } from '../../components/common/RatingModal';
import imageCompression from 'browser-image-compression';
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw,
  Info,
  Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DiseaseDetectionPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { queuePrediction, saveReportLocally, isOnline } = useOfflineSync();

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [blurryError, setBlurryError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBlurryError(null);
    setResult(null);

    try {
      // Compress image client-side for low-bandwidth rural networks
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.warn('Compression fallback', err);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast.error('Please upload or snap a leaf photo first.');
      return;
    }

    setAnalyzing(true);
    setBlurryError(null);

    try {
      const diagnosis = await mlApi.predictDisease(imageFile);

      if (!diagnosis.success) {
        setBlurryError(diagnosis.message || t('retake_photo_prompt'));
        toast.error('Image unclear. Please retake photo.');
        return;
      }

      setResult(diagnosis);

      // Attempt Cloudinary permanent image upload
      let finalImageUrl = previewUrl;
      if (isOnline) {
        const cloudUrl = await uploadImageToCloudinary(imageFile);
        if (cloudUrl) {
          finalImageUrl = cloudUrl;
        }
      }

      // Save report
      const report = {
        id: `disease_${Date.now()}`,
        farmerId: profile?.uid,
        farmerName: profile?.fullName || 'Farmer',
        timestamp: new Date().toISOString(),
        type: 'disease',
        crop: diagnosis.crop || 'Solanaceae',
        result: diagnosis,
        imageUrl: finalImageUrl,
        isSynced: isOnline
      };

      if (isOnline) {
        saveReportLocally(report);
      } else {
        queuePrediction(report);
      }
      toast.success('Diagnosis completed!');
    } catch (err) {
      toast.error(err.message || 'Diagnosis failed. Check ML service connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  const speechText = result
    ? `Diagnosis: ${result.common_name}. Severity: ${result.severity}. Organic remedy: ${result.treatment?.organic}. Chemical remedy: ${result.treatment?.chemical}. Bayanin Hausa: ${result.treatment?.hausa_action}`
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-stone-900">{t('card_disease_title')}</h1>
          <p className="text-xs text-stone-500">13 Solanaceae Classes (Early/Late Blights, Viruses, Healthy)</p>
        </div>
      </div>

      {/* Camera / Upload Action Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 text-center">
          
          {previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="Selected Leaf Preview"
                className="max-h-64 mx-auto rounded-xl object-contain shadow-md border border-stone-200"
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-stone-300 shadow-xs cursor-pointer"
                >
                  Change Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Leaf className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800">
                  Take or select a clear photo of an infected leaf
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Focus on a single leaf with good natural sunlight in your Jos South field
                </p>
              </div>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm touch-target cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t('take_photo_btn')}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-stone-300 touch-target cursor-pointer"
            >
              <Upload className="w-4 h-4 text-stone-600" />
              <span>{t('upload_image_btn')}</span>
            </button>
          </div>
        </div>

        {/* Analyze Button */}
        {previewUrl && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target cursor-pointer"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Diagnosing with MobileNetV2...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Run AI Disease Diagnosis
              </span>
            )}
          </button>
        )}
      </div>

      {/* Blurry Error State */}
      {blurryError && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 text-amber-950 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Retake Photo Needed (Hoton bai fito sarai ba)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {blurryError}
          </p>
          <p className="text-xs text-amber-900 font-medium italic pt-1 border-t border-amber-200">
            Shawarar daukar hoto: Rike wayarka da kyau, ka tabbatar akwai hasken rana, kuma ganye daya kawai ya cika allon kyamararka.
          </p>
        </div>
      )}

      {/* Diagnosis Results */}
      {result && (
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-lg space-y-5 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-stone-900">
                {t('disease_result_title')}
              </h3>
            </div>
            <SpeechButton text={speechText} />
          </div>

          {/* Disease Banner */}
          <div className={`p-4 rounded-2xl border ${
            result.is_healthy 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    result.is_healthy 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {result.severity || 'Moderate'} Severity
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    Confidence: <span className="text-emerald-700 font-black">{result.confidence}%</span>
                  </span>
                </div>

                <h4 className="text-lg font-black text-stone-900 mt-2">
                  {result.common_name || result.disease_name}
                </h4>
                <p className="text-xs text-stone-600 italic">
                  {result.hausa_name}
                </p>
              </div>
            </div>
          </div>

          {/* Treatment Options (Organic & Chemical) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Organic Treatment */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-900">
                <Leaf className="w-4 h-4 text-emerald-700" />
                <span>{t('organic_treatment_title')}</span>
              </div>
              <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                {result.treatment?.organic}
              </p>
            </div>

            {/* Chemical Treatment */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-blue-900">
                <ShieldAlert className="w-4 h-4 text-blue-700" />
                <span>{t('chemical_treatment_title')}</span>
              </div>
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                {result.treatment?.chemical}
              </p>
            </div>
          </div>

          {/* Hausa Action & Prevention */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
            <h5 className="text-xs font-black uppercase text-stone-800">
              Shawarar Yaki da Wannan Cuta (Hausa)
            </h5>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold">
              {result.treatment?.hausa_action}
            </p>
            <div className="pt-2 border-t border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 uppercase">Field Prevention:</span>
              <p className="text-xs text-stone-600 mt-0.5">
                {result.treatment?.prevention}
              </p>
            </div>
          </div>

          <RatingSection onSaveRating={() => toast.success('Diagnosis feedback saved.')} />
        </div>
      )}

    </div>
  );
}
