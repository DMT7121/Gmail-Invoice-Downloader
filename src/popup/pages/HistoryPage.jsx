// ============================================================
// HistoryPage.jsx — Lịch sử quét & tải
// ============================================================

import { useState, useEffect } from 'react';
import { storage } from '../../shared/storageManager.js';
import { formatDateTime } from '../../shared/utils.js';

export default function HistoryPage({ navigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const records = await storage.getScanHistory();
    setHistory(records);
    setLoading(false);
  };

  const clearHistory = async () => {
    if (confirm('Xóa toàn bộ lịch sử quét?')) {
      await storage.set('scanHistory', []);
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">Chưa có lịch sử</div>
        <div className="empty-state-desc">
          Thực hiện quét email để xem lịch sử tại đây
        </div>
        <button
          className="btn btn-primary mt-4"
          onClick={() => navigate('dashboard')}
        >
          🔍 Quét ngay
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Lịch sử quét</h2>
        <button className="btn btn-danger btn-sm" onClick={clearHistory}>
          🗑 Xóa
        </button>
      </div>

      <div className="email-list">
        {history.map((record, i) => (
          <div key={i} className="card card-compact">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                {formatDateTime(record.timestamp)}
              </span>
              <div className="flex gap-2">
                <span className="tag tag-success">{record.emailCount} email</span>
                <span className="tag tag-xml">{record.fileCount} file</span>
              </div>
            </div>
            {record.filters && (
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                {record.filters.dateFrom && (
                  <span>📅 {record.filters.dateFrom} → {record.filters.dateTo || 'nay'} </span>
                )}
                {record.filters.keywords?.length > 0 && (
                  <span>🔑 {record.filters.keywords.slice(0, 3).join(', ')}{record.filters.keywords.length > 3 ? '...' : ''}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
