import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Trash2, 
  Eye, 
  X, 
  MapPin, 
  Phone, 
  Sprout, 
  FileText,
  RefreshCw,
  FolderOpen,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Mail,
  Calendar
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const JOS_SOUTH_VILLAGES = [
  'Vom',
  'Bukuru',
  'Du',
  'Gyel',
  'Tudun Wada',
  'Kwata',
  'Zawan',
  'Shen',
  'Kuru'
];

export default function AdminUsers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [viewingFarmer, setViewingFarmer] = useState(null);
  const [farmerReports, setFarmerReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'farmers'));
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setFarmers(list);
    } catch (err) {
      console.error('Could not fetch farmers:', err);
      toast.error('Could not load farmers list. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Update Status: 'active' | 'suspended' | 'deactivated'
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'farmers', id), { status: newStatus });
      setFarmers(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      toast.success(`Account status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update account status.');
    }
  };

  // Toggle Role: 'farmer' <-> 'admin'
  const handleToggleRole = async (farmer) => {
    const nextRole = farmer.role === 'admin' ? 'farmer' : 'admin';
    const confirmMsg = nextRole === 'admin'
      ? `Promote ${farmer.fullName || 'this user'} to System Administrator? They will have full access to /admin.`
      : `Demote ${farmer.fullName || 'this user'} back to standard Farmer?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateDoc(doc(db, 'farmers', farmer.id), { role: nextRole });
      setFarmers(prev => prev.map(f => f.id === farmer.id ? { ...f, role: nextRole } : f));
      toast.success(`User role updated to ${nextRole.toUpperCase()}.`);
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error('Failed to change user role.');
    }
  };

  // Delete User Confirmation & Execution
  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'farmers', deleteCandidate.id));
      setFarmers(prev => prev.filter(f => f.id !== deleteCandidate.id));
      toast.success(`User ${deleteCandidate.fullName || deleteCandidate.id} has been permanently deleted.`);
      setDeleteCandidate(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Failed to delete user from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Reports Modal
  const handleOpenReports = async (farmer) => {
    setViewingFarmer(farmer);
    setLoadingReports(true);
    setFarmerReports([]);
    try {
      const q = query(collection(db, 'predictions'), where('farmerId', '==', farmer.id));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
      setFarmerReports(list);
    } catch (err) {
      console.warn('Could not fetch farmer reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Filter Logic
  const filtered = farmers.filter(f => {
    if (villageFilter !== 'all' && f.village !== villageFilter) return false;
    if (statusFilter !== 'all') {
      const s = f.status || 'active';
      if (s !== statusFilter) return false;
    }
    if (roleFilter !== 'all') {
      const r = f.role || 'farmer';
      if (r !== roleFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (f.fullName || '').toLowerCase().includes(q);
      const phoneMatch = (f.phone || '').includes(q);
      const emailMatch = (f.email || '').toLowerCase().includes(q);
      const villageMatch = (f.village || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch || emailMatch || villageMatch;
    }
    return true;
  });

  // Dynamic counts derived from real data
  const totalCount = farmers.length;
  const activeCount = farmers.filter(f => !f.status || f.status === 'active').length;
  const suspendedCount = farmers.filter(f => f.status === 'suspended' || f.status === 'deactivated').length;
  const adminCount = farmers.filter(f => f.role === 'admin').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900">
              User Management & Directory
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage smallholder accounts, permissions, account status (active/suspended), and diagnostic histories
          </p>
        </div>

        <button
          onClick={fetchFarmers}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Refresh users"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Accounts</p>
          <p className="text-2xl font-black text-stone-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Suspended</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{suspendedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Administrators</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{adminCount}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or village..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 sm:flex-none p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="admin">Admins</option>
          </select>

          {/* Village Filter */}
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="flex-1 sm:flex-none p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Villages (Jos South)</option>
            {JOS_SOUTH_VILLAGES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Farmers Directory Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-stone-600">Loading user accounts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-black text-stone-700">No Users Found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {farmers.length === 0 
                ? 'No user accounts found in Firestore. New accounts will appear here automatically.'
                : 'No users match your current search and filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">User & Contact</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Farm Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filtered.map((f) => {
                  const isUserAdmin = f.role === 'admin';
                  const currentStatus = f.status || 'active';

                  return (
                    <tr key={f.id} className="hover:bg-stone-50/80 transition-colors">
                      
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{f.fullName || 'Unnamed User'}</div>
                        <div className="text-[11px] text-stone-400 font-normal">{f.email || 'No email stored'}</div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">{f.phone || 'No phone'}</div>
                      </td>

                      {/* Village */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-800">{f.village || 'Jos South'}</span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleRole(f)}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                            isUserAdmin
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                          }`}
                          title="Click to change role (Farmer / Admin)"
                        >
                          {isUserAdmin ? 'Admin' : 'Farmer'}
                        </button>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleUpdateStatus(f.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            currentStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : currentStatus === 'suspended'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="deactivated">Deactivated</option>
                        </select>
                      </td>

                      {/* Farm Details */}
                      <td className="py-3 px-4">
                        <div className="text-stone-700">
                          {f.farmSize ? `${f.farmSize} acres` : 'N/A'} • <span className="capitalize">{Array.isArray(f.cropsGrown) ? f.cropsGrown.join(', ') : (f.cropsGrown || 'Potato/Tomato')}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{f.soilType || 'Highland Soil'}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Reports */}
                          <button
                            onClick={() => handleOpenReports(f)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
                            title="View diagnostic history"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteCandidate(f)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">Delete User Account</h3>
                <p className="text-xs text-stone-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900">{deleteCandidate.fullName || deleteCandidate.email}</strong>? 
              This will remove their profile from the database.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer History / Reports Modal */}
      {viewingFarmer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  {viewingFarmer.fullName || 'Farmer Profile'}
                </h3>
                <p className="text-xs text-stone-500">
                  {viewingFarmer.village || 'Jos South'} • {viewingFarmer.phone || 'No phone'} • {viewingFarmer.email || 'No email'}
                </p>
              </div>
              <button
                onClick={() => setViewingFarmer(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Role</span>
                <span className="font-extrabold capitalize text-stone-800">{viewingFarmer.role || 'farmer'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="font-extrabold capitalize text-stone-800">{viewingFarmer.status || 'active'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Farm Acreage</span>
                <span className="font-extrabold text-stone-800">{viewingFarmer.farmSize ? `${viewingFarmer.farmSize} acres` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Soil Type</span>
                <span className="font-extrabold text-stone-800">{viewingFarmer.soilType || 'Highland Soil'}</span>
              </div>
            </div>

            {/* Diagnostic Records */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Agronomic Evaluations ({farmerReports.length})
              </h4>
              <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
                {loadingReports ? (
                  <div className="py-6 text-center text-stone-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                    <p>Loading reports...</p>
                  </div>
                ) : farmerReports.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 bg-stone-50 rounded-2xl">
                    <FileText className="w-6 h-6 mx-auto stroke-1 mb-1 text-stone-300" />
                    <p className="font-semibold text-xs">No diagnosis or prediction reports recorded yet.</p>
                  </div>
                ) : (
                  farmerReports.map((rep) => (
                    <div key={rep.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex justify-between font-bold text-stone-700">
                        <span className="capitalize">{rep.type || 'Evaluation'} ({rep.crop || 'Crop'})</span>
                        <span className="text-emerald-700 font-extrabold">
                          {rep.result?.confidence ? `${rep.result.confidence}%` : 'Recorded'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        {rep.result?.common_name || rep.result?.title || rep.result?.interpretation || 'Assessment completed'}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(rep.timestamp || rep.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setViewingFarmer(null)}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
