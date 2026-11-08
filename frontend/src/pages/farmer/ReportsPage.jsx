import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { downloadReportPDF } from '../../services/reportService';
import SpeechButton from '../../components/common/SpeechButton';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Search, 
  Eye, 
  X, 
  CheckCircle, 
  WifiOff, 
  Sparkles,
  HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { cachedReports, isOnline } = useOfflineSync();

  const [typeFilter, setTypeFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Filtered reports
  const filtered = cachedReports.filter((rep) => {
    if (typeFilter !== 'all' && rep.type !== typeFilter) return false;
    if (cropFilter !== 'all') {
      const repCrop = (rep.crop || '').toLowerCase();
      if (!repCrop.includes(cropFilter)) return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchType = (rep.type || '').toLowerCase().includes(query);
      const matchCrop = (rep.crop || '').toLowerCase().includes(query);
      if (!matchType && !matchCrop) return false;
    }
    return true;
  });

  // Synthesise Combined Farm Health Report from latest entries
  const handleGenerateFarmHealthReport = () => {
    if (cachedReports.length === 0) {
      toast.error('No advisory records available to generate report. Run a disease, crop, fertilizer, or yield assessment first.');
      return;
    }

    const latestDisease = cachedReports.find(r => r.type === 'disease');
    const latestYield = cachedReports.find(r => r.type === 'yield');
    const latestFertilizer = cachedReports.find(r => r.type === 'fertilizer');

    const combinedReport = {
      id: `health_summary_${Date.now()}`,
      farmerId: profile?.uid,
      timestamp: new Date().toISOString(),
      type: 'combined',
      crop: 'Potato & Tomato',
      diseaseSummary: latestDisease?.result?.common_name || 'No disease assessment recorded',
      yieldSummary: latestYield?.result?.yield_kg_per_acre ? `${latestYield.result.yield_kg_per_acre} kg/acre` : 'No yield forecast recorded',
      fertilizerSummary: latestFertilizer?.result?.title || 'No fertilizer advisory recorded',
      irrigationSummary: 'Consult local extension agent or sensor telemetry for precise field watering schedules in Jos South.',
      result: {
        disease: latestDisease?.result,
        yield: latestYield?.result,
        fertilizer: latestFertilizer?.result
      }
    };

    downloadReportPDF(combinedReport, profile);
    toast.success('Combined Farm Health Report PDF downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900">{t('nav_reports')}</h1>
            <p className="text-xs text-stone-500">
              Offline-ready 30-day advisory archive & client-side PDF export
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateFarmHealthReport}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer touch-target self-start sm:self-auto"
        >
          <HeartPulse className="w-4 h-4 text-emerald-300" />
          <span>Combined Farm Health Report</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search reports by crop or disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-stone-700"
          >
            <option value="all">All Prediction Types</option>
            <option value="disease">Disease Diagnoses</option>
            <option value="crop">Crop Recommendations</option>
            <option value="fertilizer">Fertilizer Suggestions</option>
            <option value="yield">Yield Predictions</option>
          </select>

          {/* Crop Filter */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-stone-700"
          >
            <option value="all">All Crops</option>
            <option value="potato">Irish Potato</option>
            <option value="tomato">Tomato</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/80">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700">No Advisory Reports Found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Run a crop, disease, fertilizer, or yield prediction on the home screen to automatically save your diagnostic report.
            </p>
          </div>
        ) : (
          filtered.map((rep) => {
            const dateStr = new Date(rep.timestamp).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={rep.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 hover:border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {rep.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 capitalize">
                      {rep.crop || 'Plateau Crops'}
                    </span>
                    {!rep.isSynced && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <WifiOff className="w-2.5 h-2.5" />
                        Local
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-stone-900">
                    {rep.type === 'disease' && (rep.result?.common_name || 'Disease Diagnosis')}
                    {rep.type === 'crop' && 'Crop Suitability Evaluation'}
                    {rep.type === 'fertilizer' && (rep.result?.title || 'Fertilizer Recommendation')}
                    {rep.type === 'yield' && `Yield: ${rep.result?.yield_kg_per_acre} kg/acre (${rep.result?.interpretation})`}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Recorded on {dateStr} • Farmer: {profile?.fullName || 'Farmer'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setSelectedReport(rep)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer touch-target"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => downloadReportPDF(rep, profile)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer touch-target"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-stone-900 capitalize">
                  {selectedReport.type} Report Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-500 uppercase text-[10px]">Diagnosis Summary</span>
                <p className="font-extrabold text-sm text-stone-900 mt-0.5">
                  {selectedReport.result?.common_name || selectedReport.result?.title || 'Prediction Completed'}
                </p>
                {selectedReport.result?.severity && (
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                    {selectedReport.result.severity} Severity
                  </span>
                )}
              </div>

              {selectedReport.result?.treatment && (
                <div className="space-y-2">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 text-[11px] uppercase">Organic Remedy:</span>
                    <p className="text-emerald-900 mt-0.5">{selectedReport.result.treatment.organic}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 text-[11px] uppercase">Chemical Control:</span>
                    <p className="text-blue-900 mt-0.5">{selectedReport.result.treatment.chemical}</p>
                  </div>
                </div>
              )}

              {selectedReport.result?.action && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 text-[11px] uppercase">Fertilizer Action:</span>
                  <p className="text-amber-900 mt-0.5">{selectedReport.result.action}</p>
                </div>
              )}

              {selectedReport.result?.yield_kg_per_acre && (
                <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
                  <span className="font-bold text-teal-900 text-[11px] uppercase">Forecasted Harvest:</span>
                  <p className="text-teal-950 font-black text-sm mt-0.5">
                    {selectedReport.result.yield_kg_per_acre} kg per acre ({selectedReport.result.yield_kg_per_hectare} kg/ha)
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <SpeechButton 
                text={selectedReport.result?.common_name || selectedReport.result?.action || 'Report details'} 
              />
              <button
                onClick={() => downloadReportPDF(selectedReport, profile)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
