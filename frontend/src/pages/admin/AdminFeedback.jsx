import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Mail, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle,
  Clock,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function AdminFeedback() {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackList, setFeedbackList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch contact messages
      try {
        const msgSnap = await getDocs(collection(db, 'contactMessages'));
        const msgs = [];
        msgSnap.forEach(d => {
          const data = d.data();
          msgs.push({
            id: d.id,
            name: data.name || 'Anonymous',
            email: data.email || 'No email provided',
            village: data.village || 'Jos South',
            message: data.message || '',
            date: (data.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
          });
        });
        msgs.sort((a, b) => b.date.localeCompare(a.date));
        setMessagesList(msgs);
      } catch (err) {
        console.warn('Could not fetch contact messages:', err);
      }

      // 2. Fetch feedback from predictions or feedback collection
      try {
        const predSnap = await getDocs(collection(db, 'predictions'));
        const fb = [];
        predSnap.forEach(d => {
          const data = d.data();
          const rating = data.farmerRating || data.rating;
          const comment = data.farmerComment || data.comment;
          if (rating || comment) {
            fb.push({
              id: d.id,
              farmerName: data.farmerName || 'Farmer',
              village: data.village || 'Jos South',
              rating: rating || 5,
              comment: comment || 'Rated prediction advisory accuracy.',
              date: (data.timestamp || data.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
            });
          }
        });
        fb.sort((a, b) => b.date.localeCompare(a.date));
        setFeedbackList(fb);
      } catch (err) {
        console.warn('Could not fetch feedback:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900">Farmer Feedback & Messages</h1>
            <p className="text-xs text-stone-500">Monitor model accuracy satisfaction and community inquiries</p>
          </div>
        </div>

        {/* Tab switch and Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Farmer Ratings ({feedbackList.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Contact Inquiries ({messagesList.length})
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200/80 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-600">Loading feedback and messages...</p>
        </div>
      ) : activeTab === 'feedback' ? (
        /* Farmer Feedback List */
        <div className="space-y-3">
          {feedbackList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
              <FolderOpen className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-sm font-black text-stone-700">No Farmer Ratings Yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Ratings and feedback submitted by farmers after receiving disease, fertilizer, or yield predictions will appear here.
              </p>
            </div>
          ) : (
            feedbackList.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2 hover:border-amber-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{item.farmerName}</span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {item.village}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${
                          i < item.rating 
                            ? 'text-amber-500 fill-amber-400' 
                            : 'text-stone-200'
                        }`} 
                      />
                    ))}
                    <span className="text-xs font-mono font-bold text-stone-500 ml-1">{item.date}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  "{item.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Contact Messages List */
        <div className="space-y-3">
          {messagesList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
              <FolderOpen className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-sm font-black text-stone-700">No Contact Messages Yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Messages submitted through the public Contact page by farmers, cooperatives, and extension agents will appear here.
              </p>
            </div>
          ) : (
            messagesList.map((msg) => (
              <div 
                key={msg.id} 
                className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2 hover:border-emerald-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{msg.name}</h4>
                    <p className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {msg.email} • {msg.village}
                    </p>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">{msg.date}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
