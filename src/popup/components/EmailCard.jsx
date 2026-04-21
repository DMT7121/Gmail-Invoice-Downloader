// ============================================================
// EmailCard.jsx — Card hiển thị 1 email và attachments
// ============================================================

import { formatDateTime, truncate } from '../../shared/utils.js';
import AttachmentBadge from './AttachmentBadge.jsx';

export default function EmailCard({ email, selected, onToggle }) {
  return (
    <div
      className={`email-card ${selected ? 'selected' : ''}`}
      onClick={() => onToggle(email.id)}
    >
      <input
        type="checkbox"
        className="email-checkbox"
        checked={selected}
        onChange={() => onToggle(email.id)}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="email-info">
        <div className="email-sender">{email.senderName || 'Không rõ'}</div>
        <div className="email-subject">{truncate(email.subject, 60)}</div>
        <div className="email-date">{formatDateTime(email.internalDate)}</div>

        <div className="email-attachments">
          {email.attachments.map((att, i) => (
            <AttachmentBadge key={i} attachment={att} />
          ))}
        </div>

        {email.warnings?.length > 0 && (
          <div className="email-warnings">
            {email.warnings.map((w, i) => (
              <div key={i} className="alert alert-warning" style={{ padding: '4px 8px', marginTop: '4px' }}>
                <span className="alert-icon">⚠️</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
