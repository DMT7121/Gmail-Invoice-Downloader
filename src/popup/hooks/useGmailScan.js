// ============================================================
// useGmailScan.js — Hook quản lý quá trình quét email
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { MSG } from '../../shared/messageTypes.js';

export function useGmailScan() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const listenerRef = useRef(null);

  // Lắng nghe progress updates từ background
  useEffect(() => {
    const listener = (message) => {
      if (message.type === MSG.SCAN_PROGRESS) {
        setProgress(message);
      }
    };

    listenerRef.current = listener;
    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const startScan = useCallback(async (filters) => {
    setScanning(true);
    setProgress(null);
    setResults(null);
    setStats(null);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: MSG.SCAN_START,
        filters,
      });

      if (response.success) {
        setResults(response.results);
        setStats(response.stats);
      } else {
        setError(response.error || 'Quét thất bại');
      }

      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setScanning(false);
      setProgress(null);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setStats(null);
    setError(null);
    setProgress(null);
  }, []);

  return {
    scanning,
    progress,
    results,
    stats,
    error,
    startScan,
    clearResults,
  };
}
