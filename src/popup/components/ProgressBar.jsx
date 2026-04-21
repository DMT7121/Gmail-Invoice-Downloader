// ============================================================
// ProgressBar.jsx — Thanh tiến trình đa năng
// ============================================================

export default function ProgressBar({ percent, indeterminate = false, label = '' }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
            {label}
          </span>
          {!indeterminate && (
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
              {Math.round(percent || 0)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar-container ${indeterminate ? 'progress-bar-indeterminate' : ''}`}>
        <div
          className="progress-bar-fill"
          style={{ width: indeterminate ? '30%' : `${Math.min(percent || 0, 100)}%` }}
        />
      </div>
    </div>
  );
}
