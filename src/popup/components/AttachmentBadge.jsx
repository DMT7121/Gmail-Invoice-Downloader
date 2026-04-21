// ============================================================
// AttachmentBadge.jsx — Badge hiển thị file type
// ============================================================

import { formatFileSize } from '../../shared/utils.js';

export default function AttachmentBadge({ attachment }) {
  const ext = attachment.extension?.replace('.', '').toUpperCase() || 'FILE';

  const getTagClass = () => {
    switch (attachment.extension) {
      case '.pdf': return 'tag-pdf';
      case '.xml': return 'tag-xml';
      case '.zip': return 'tag-zip';
      default: return '';
    }
  };

  return (
    <span className={`tag ${getTagClass()}`} title={attachment.filename}>
      {ext}
      {attachment.size > 0 && (
        <span style={{ opacity: 0.7, fontSize: '10px' }}>
          {formatFileSize(attachment.size)}
        </span>
      )}
    </span>
  );
}
