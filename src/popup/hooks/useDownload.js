// ============================================================
// useDownload.js — Hook quản lý quá trình download
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { MSG } from '../../shared/messageTypes.js';

export function useDownload() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Lắng nghe download progress từ background
  useEffect(() => {
    const listener = (message) => {
      if (message.type === MSG.DOWNLOAD_PROGRESS) {
        setProgress(message);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const startDownload = useCallback(async (emailIds = null, allResults = null, groupBySupplier = true) => {
    setDownloading(true);
    setProgress(null);
    setError(null);
    setResult(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: MSG.DOWNLOAD_START,
        emailIds,
        allResults,
        groupBySupplier,
      });

      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Tải thất bại');
      }

      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setDownloading(false);
      setProgress(null);
    }
  }, []);

  return {
    downloading,
    progress,
    error,
    result,
    startDownload,
  };
}
