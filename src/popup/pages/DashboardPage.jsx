// ============================================================
// DashboardPage.jsx — Trang chính: Filter + Quét
// ============================================================

import { useState } from 'react';
import { useGmailScan } from '../hooks/useGmailScan.js';
import { DEFAULT_KEYWORDS } from '../../shared/constants.js';
import ProgressBar from '../components/ProgressBar.jsx';

export default function DashboardPage({ navigate }) {
  const { scanning, progress, error, startScan } = useGmailScan();

  // Filter state
  const [keywords, setKeywords] = useState([...DEFAULT_KEYWORDS]);
  const [keywordInput, setKeywordInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fileTypes, setFileTypes] = useState(['pdf', 'xml', 'zip']);
  const [useKeywords, setUseKeywords] = useState(true);

  // Add keyword
  const handleKeywordAdd = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  // Remove keyword
  const handleKeywordRemove = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  // Toggle file type
  const toggleFileType = (type) => {
    setFileTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Start scan
  const handleScan = async () => {
    const filters = {
      keywords: useKeywords ? keywords : [],
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      fileTypes,
    };

    const result = await startScan(filters);
    if (result?.success) {
      navigate('results', result);
    }
  };

  // Quick date range helpers
  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateFrom(toInputDate(start));
    setDateTo(toInputDate(end));
  };

  const setMonthRange = (monthsAgo) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - monthsAgo);
    start.setDate(1);
    setDateFrom(toInputDate(start));
    setDateTo(toInputDate(end));
  };

  // Scanning overlay
  if (scanning) {
    return (
      <div className="scan-overlay">
        <div className="scan-overlay-icon">🔍</div>
        <div className="scan-overlay-title">Đang quét email...</div>
        <div className="scan-overlay-message">
          {progress?.message || 'Đang kết nối Gmail API...'}
        </div>
        {progress?.total > 0 && (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <ProgressBar
              percent={Math.round((progress.processed / progress.total) * 100)}
              label={`${progress.processed || 0} / ${progress.total} email`}
            />
          </div>
        )}
        {!progress?.total && (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <ProgressBar indeterminate label="Đang tìm kiếm..." />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="filter-section">
      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Keywords */}
      <div className="form-group">
        <div className="flex items-center justify-between">
          <label className="form-label">Từ khóa tìm kiếm</label>
          <label className="file-type-option" style={{ fontSize: 'var(--font-xs)' }}>
            <input
              type="checkbox"
              checked={useKeywords}
              onChange={(e) => setUseKeywords(e.target.checked)}
            />
            Bật
          </label>
        </div>
        {useKeywords && (
          <div className="filter-keywords">
            {keywords.map((kw) => (
              <span key={kw} className="keyword-chip">
                {kw}
                <span className="keyword-chip-remove" onClick={() => handleKeywordRemove(kw)}>
                  ✕
                </span>
              </span>
            ))}
            <input
              type="text"
              className="keyword-input"
              placeholder="Thêm từ khóa..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordAdd}
            />
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="form-group">
        <label className="form-label">Khoảng thời gian</label>
        <div className="filter-row">
          <input
            type="date"
            className="form-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="Từ ngày"
          />
          <input
            type="date"
            className="form-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Đến ngày"
          />
        </div>
        <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setQuickRange(7)}>7 ngày</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setQuickRange(30)}>30 ngày</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMonthRange(1)}>Tháng này</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMonthRange(3)}>3 tháng</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMonthRange(6)}>6 tháng</button>
        </div>
      </div>

      {/* File Types */}
      <div className="form-group">
        <label className="form-label">Loại file đính kèm</label>
        <div className="file-type-group">
          <label className="file-type-option">
            <input
              type="checkbox"
              checked={fileTypes.includes('pdf')}
              onChange={() => toggleFileType('pdf')}
            />
            <span className="tag tag-pdf">PDF</span>
          </label>
          <label className="file-type-option">
            <input
              type="checkbox"
              checked={fileTypes.includes('xml')}
              onChange={() => toggleFileType('xml')}
            />
            <span className="tag tag-xml">XML</span>
          </label>
          <label className="file-type-option">
            <input
              type="checkbox"
              checked={fileTypes.includes('zip')}
              onChange={() => toggleFileType('zip')}
            />
            <span className="tag tag-zip">ZIP</span>
          </label>
        </div>
      </div>

      {/* Scan Button */}
      <button
        className="btn btn-primary btn-lg btn-full"
        onClick={handleScan}
        disabled={scanning || fileTypes.length === 0}
      >
        🔍 Bắt đầu quét email
      </button>

      {/* Info */}
      <div className="alert alert-info">
        <span className="alert-icon">ℹ️</span>
        <span>
          Extension sẽ tìm các email có file đính kèm ({fileTypes.join(', ').toUpperCase()})
          {useKeywords && keywords.length > 0 && ` chứa từ khóa "${keywords[0]}"${keywords.length > 1 ? ` +${keywords.length - 1} khác` : ''}`}
          {dateFrom && ` từ ${dateFrom}`}
          {dateTo && ` đến ${dateTo}`}.
        </span>
      </div>
    </div>
  );
}

// Helper
function toInputDate(date) {
  return date.toISOString().split('T')[0];
}
