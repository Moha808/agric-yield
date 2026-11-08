import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  Search, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [villageFilter, setVillageFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'predictions'));
      const list = [];
      snap.forEach(d => {
        const data = d.data();
        let diag = 'N/A';
        let conf = 'N/A';
        let yieldVal = 'N/A';

        if (data.type === 'disease') {
          diag = data.result?.common_name || data.result?.disease_name || 'Diagnosis';
          conf = data.result?.confidence ? `${data.result.confidence}%` : 'N/A';
        } else if (data.type === 'crop') {
          const topCrop = data.result?.recommendations?.[0];
          diag = topCrop ? `Recommended: ${topCrop.crop}` : 'Crop Advisory';
          conf = topCrop?.confidence ? `${topCrop.confidence}%` : 'N/A';
        } else if (data.type === 'fertilizer') {
          diag = data.result?.title || 'Fertilizer Advisory';
          conf = data.result?.priority_nutrient || 'N/A';
        } else if (data.type === 'yield') {
          yieldVal = data.result?.yield_kg_per_acre ? `${data.result.yield_kg_per_acre} kg/acre` : 'N/A';
          diag = data.result?.interpretation || 'Yield Forecast';
          conf = data.result?.confidence_score ? `${Math.round(data.result.confidence_score * 100)}%` : 'N/A';
        }

        list.push({
          id: d.id,
          farmerName: data.farmerName || data.farmer_name || 'Farmer',
          village: data.village || 'Jos South',
          crop: data.crop || 'Solanaceae',
          type: data.type || 'assessment',
          diagnosis: diag,
          confidence: conf,
          yieldForecast: yieldVal,
          date: (data.timestamp || data.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
        });
      });

      // Sort newest first
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setReports(list);
    } catch (err) {
      console.warn('Could not fetch reports:', err);
      toast.error('Could not load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    if (villageFilter !== 'all' && r.village !== villageFilter) return false;
    if (cropFilter !== 'all' && !r.crop.toLowerCase().includes(cropFilter)) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = r.farmerName.toLowerCase().includes(q);
      const diagMatch = r.diagnosis.toLowerCase().includes(q);
      return nameMatch || diagMatch;
    }
    return true;
  });

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No reports available to export.');
      return;
    }

    const headers = ['Report ID', 'Farmer Name', 'Village', 'Crop', 'Type', 'Diagnosis / Summary', 'Confidence', 'Yield Forecast', 'Date'];
    const rows = filtered.map(r => [
      r.id,
      `"${r.farmerName}"`,
      r.village,
      r.crop,
      r.type,
      `"${r.diagnosis}"`,
      r.confidence,
      `"${r.yieldForecast}"`,
      r.date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agriyield_jos_south_master_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Master CSV report downloaded!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-stone-900">
            Master Diagnostic & Prediction Archive
          </h1>
          <p className="text-xs text-stone-500">
            Cross-village agronomic intelligence database with one-click tabular CSV download
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer touch-target"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagnosis or farmer name..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Villages</option>
            <option value="Vom">Vom</option>
            <option value="Bukuru">Bukuru</option>
            <option value="Du">Du</option>
            <option value="Gyel">Gyel</option>
            <option value="Tudun Wada">Tudun Wada</option>
            <option value="Kwata">Kwata</option>
            <option value="Zawan">Zawan</option>
            <option value="Shen">Shen</option>
          </select>

          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Crops</option>
            <option value="potato">Irish Potato</option>
            <option value="tomato">Tomato</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="disease">Disease Detection</option>
            <option value="crop">Crop Recommendation</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="yield">Yield Prediction</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-stone-600">Loading master prediction archive...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-black text-stone-700">No Reports Found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {reports.length === 0 
                ? 'No farmer predictions have been saved to the database yet. When farmers perform disease detection, crop recommendations, fertilizer analysis, or yield forecasts, they will appear here.'
                : 'No reports match your current search and filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Diagnosis / Result</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Yield Forecast</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-stone-400">{r.id.slice(0, 12)}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{r.farmerName}</td>
                    <td className="py-3 px-4">{r.village}</td>
                    <td className="py-3 px-4 capitalize font-semibold text-emerald-800">{r.crop}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">{r.diagnosis}</td>
                    <td className="py-3 px-4 font-bold text-stone-700">{r.confidence}</td>
                    <td className="py-3 px-4 font-bold text-teal-700">{r.yieldForecast}</td>
                    <td className="py-3 px-4 text-stone-400">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
