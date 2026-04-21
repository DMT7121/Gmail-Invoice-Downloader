// ============================================================
// ResultsPage.jsx — Hiển thị kết quả quét + Download
// ============================================================

import { useState } from 'react';
import { useDownload } from '../hooks/useDownload.js';
import { formatFileSize } from '../../shared/utils.js';
import StatsPanel from '../components/StatsPanel.jsx';
import EmailCard from '../components/EmailCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function ResultsPage({ scanData, navigate }) {
  const { downloading, progress: dlProgress, error: dlError, result: dlResult, startDownload } = useDownload();
  const [selectedIds, setSelectedIds] = useState(new Set());

  const results = scanData?.results || [];
  const stats = scanData?.stats || {};

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all / none
  const toggleAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map((r) => r.id)));
    }
  };

  // Download
  const handleDownload = async () => {
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : null;
    await startDownload(ids, results);
  };

  // No results
  if (results.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <div className="empty-state-title">Không tìm thấy hóa đơn nào</div>
        <div className="empty-state-desc">
          Thử mở rộng khoảng thời gian hoặc thay đổi từ khóa
        </div>
        <button
          className="btn btn-ghost mt-4"
          onClick={() => navigate('dashboard')}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  // Download complete
  if (dlResult) {
    return (
      <div className="download-result">
        <div className="download-result-icon">✅</div>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Tải thành công!
        </h2>
        <div className="stats-grid" style={{ width: '100%' }}>
          <div className="stat-item">
            <div className="stat-value">{dlResult.fileCount}</div>
            <div className="stat-label">File đã tải</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatFileSize(dlResult.totalSize)}</div>
            <div className="stat-label">Tổng dung lượng</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">ZIP</div>
            <div className="stat-label">Đã đóng gói</div>
          </div>
        </div>
        <div className="alert alert-success w-full">
          <span className="alert-icon">📁</span>
          <span>File: <strong>{dlResult.filename}</strong></span>
        </div>
        <div className="flex gap-3 mt-3">
          <button className="btn btn-ghost" onClick={() => navigate('dashboard')}>
            🔍 Quét mới
          </button>
          <button className="btn btn-primary" onClick={() => navigate('history')}>
            📋 Xem lịch sử
          </button>
        </div>
      </div>
    );
  }

  // Downloading
  if (downloading) {
    return (
      <div className="scan-overlay">
        <div className="scan-overlay-icon">⬇️</div>
        <div className="scan-overlay-title">Đang tải xuống...</div>
        <div className="scan-overlay-message">
          {dlProgress?.message || 'Đang chuẩn bị...'}
        </div>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <ProgressBar
            percent={dlProgress?.percent || 0}
            indeterminate={!dlProgress?.percent}
            label={dlProgress?.phase === 'zipping' ? 'Đóng gói ZIP' : 'Tải file'}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Download error */}
      {dlError && (
        <div className="alert alert-error mt-3">
          <span className="alert-icon">❌</span>
          <span>{dlError}</span>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('dashboard')}
        >
          ← Quay lại
        </button>
        <button
          className="btn btn-success"
          onClick={handleDownload}
          disabled={downloading}
        >
          ⬇️ Tải {selectedIds.size > 0 ? `${selectedIds.size} email` : 'tất cả'} ({stats.totalFiles} files)
        </button>
      </div>

      {/* Select all bar */}
      <div className="select-all-bar">
        <label className="file-type-option">
          <input
            type="checkbox"
            checked={selectedIds.size === results.length}
            onChange={toggleAll}
          />
          <span>Chọn tất cả ({results.length})</span>
        </label>
        {selectedIds.size > 0 && (
          <span className="tag tag-success">
            Đã chọn: {selectedIds.size}
          </span>
        )}
      </div>

      {/* Email list */}
      <div className="email-list">
        {results.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            selected={selectedIds.has(email.id)}
            onToggle={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
}
