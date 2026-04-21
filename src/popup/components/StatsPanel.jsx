// ============================================================
// StatsPanel.jsx — Bảng thống kê tổng quan
// ============================================================

import { formatFileSize } from '../../shared/utils.js';

export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-item">
        <div className="stat-value">{stats.totalEmails || 0}</div>
        <div className="stat-label">Email</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalFiles || 0}</div>
        <div className="stat-label">File</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{formatFileSize(stats.totalSize || 0)}</div>
        <div className="stat-label">Dung lượng</div>
      </div>
    </div>
  );
}
