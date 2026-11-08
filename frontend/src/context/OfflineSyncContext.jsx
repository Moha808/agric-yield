import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { db, auth } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const OfflineSyncContext = createContext(null);

const QUEUE_STORAGE_KEY = 'agriyield_offline_queue';
const LOCAL_REPORTS_KEY = 'agriyield_cached_reports';

export function OfflineSyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cachedReports, setCachedReports] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_REPORTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored. Syncing offline data...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('You are currently offline. Predictions will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Could not persist queue', e);
    }
  }, [queue]);

  // Save cached reports
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(cachedReports));
    } catch (e) {
      console.warn('Could not persist cached reports', e);
    }
  }, [cachedReports]);

  // Save report locally & attempt Firestore sync if online
  const saveReportLocally = useCallback(async (report) => {
    // Update local cache state
    setCachedReports(prev => {
      const filtered = prev.filter(r => r.id !== report.id);
      const updated = [report, ...filtered];
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return updated.filter(r => new Date(r.timestamp).getTime() > thirtyDaysAgo);
    });

    // If online and authenticated, persist directly to Firestore predictions collection
    if (navigator.onLine && auth.currentUser) {
      try {
        const reportId = report.id || `pred_${Date.now()}`;
        const cleanReport = {
          ...report,
          id: reportId,
          farmerId: report.farmerId || auth.currentUser.uid,
          isSynced: true,
          syncedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'predictions', reportId), cleanReport, { merge: true });
      } catch (err) {
        console.warn('Direct Firestore save failed, adding to sync queue:', err);
        // Add to queue for background retry
        queuePrediction(report);
      }
    }
  }, []);

  // Queue an offline prediction
  const queuePrediction = useCallback((item) => {
    const queueId = item.id || `queue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const queueItem = {
      ...item,
      id: queueId,
      queueId,
      createdAt: new Date().toISOString()
    };
    setQueue(prev => [...prev, queueItem]);
    
    // Also save into local reports cache so farmer can view it immediately
    setCachedReports(prev => {
      const filtered = prev.filter(r => r.id !== queueId);
      return [{ ...queueItem, isSynced: false }, ...filtered];
    });

    toast.success('Saved to device. Will sync automatically when connected.');
  }, []);

  // Sync now
  const syncNow = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isSyncing || !auth.currentUser) return;
    setIsSyncing(true);

    try {
      let remaining = [...queue];
      const newlySynced = [];

      for (const item of queue) {
        try {
          const reportId = item.id || item.queueId;
          const cleanItem = {
            ...item,
            id: reportId,
            farmerId: item.farmerId || auth.currentUser.uid,
            isSynced: true,
            syncedAt: new Date().toISOString()
          };
          delete cleanItem.queueId;

          await setDoc(doc(db, 'predictions', reportId), cleanItem, { merge: true });
          newlySynced.push(reportId);
          remaining = remaining.filter(q => q.queueId !== item.queueId && q.id !== item.id);
        } catch (err) {
          console.warn('Sync failed for item', item, err);
        }
      }

      setQueue(remaining);

      // Update isSynced status in local cache
      setCachedReports(prev => prev.map(r => {
        if (newlySynced.includes(r.id)) {
          return { ...r, isSynced: true };
        }
        return r;
      }));

      if (newlySynced.length > 0) {
        toast.success(`Successfully synced ${newlySynced.length} prediction(s) to cloud!`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, queue, isSyncing]);

  // Trigger sync whenever back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && auth.currentUser) {
      syncNow();
    }
  }, [isOnline, queue.length, syncNow]);

  return (
    <OfflineSyncContext.Provider value={{
      isOnline,
      unsyncedCount: queue.length,
      queue,
      queuePrediction,
      syncNow,
      isSyncing,
      cachedReports,
      saveReportLocally
    }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  return ctx;
}
