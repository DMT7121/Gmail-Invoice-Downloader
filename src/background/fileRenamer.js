// ============================================================
// fileRenamer.js — Đổi tên file theo chuẩn hóa
// Format: [YYYY-MM-DD]_[Tên Nhà Cung Cấp]_[Số Hóa Đơn].[ext]
// ============================================================

import { INVOICE_PATTERNS, KNOWN_INVOICE_PROVIDERS } from '../shared/constants.js';
import { formatDate, sanitizeFilename, getHeader } from '../shared/utils.js';

/**
 * Tạo tên file chuẩn hóa cho attachment
 * 
 * @param {Object} emailInfo - Thông tin email đã parse (từ parseEmailInfo)
 * @param {Object} attachment - Thông tin file đính kèm
 * @returns {string} Tên file chuẩn hóa
 * 
 * @example
 * // Input: email từ Kamereo, file "invoice_123.pdf", gửi ngày 2024-03-15
 * // Output: "2024-03-15_Kamereo_invoice_123.pdf"
 */
export function generateStandardFilename(emailInfo, attachment) {
  // 1. Ngày gửi
  const date = formatDate(Number(emailInfo.internalDate));

  // 2. Tên nhà cung cấp
  const supplier = identifySupplier(emailInfo);

  // 3. Số hóa đơn (hoặc tên file gốc nếu không tìm được)
  const invoiceId = extractInvoiceNumber(emailInfo, attachment);

  // 4. Extension
  const ext = attachment.extension;

  // Ghép và sanitize
  const rawName = `${date}_${supplier}_${invoiceId}`;
  return sanitizeFilename(rawName) + ext;
}

/**
 * Nhận diện nhà cung cấp từ email
 */
export function identifySupplier(emailInfo) {
  const fromEmail = (emailInfo.senderEmail || '').toLowerCase();
  const fromName = emailInfo.senderName || '';
  const subject = emailInfo.subject || '';

  // 1. Kiểm tra domain email có match với NCC đã biết không
  for (const provider of KNOWN_INVOICE_PROVIDERS) {
    for (const domain of provider.domains) {
      if (fromEmail.includes(domain)) {
        return provider.name;
      }
    }
  }

  // 2. Dùng tên hiển thị của sender
  if (fromName && fromName.length > 1 && !fromName.includes('@')) {
    return fromName
      .replace(/[\[\](){}]/g, '')
      .trim()
      .substring(0, 50);
  }

  // 3. Fallback: lấy domain name từ email
  const domainMatch = fromEmail.match(/@(.+?)\./);
  if (domainMatch) {
    return capitalize(domainMatch[1]);
  }

  return 'Unknown';
}

/**
 * Trích xuất số hóa đơn từ subject hoặc tên file gốc
 */
export function extractInvoiceNumber(emailInfo, attachment) {
  const subject = emailInfo.subject || '';
  const filename = attachment.filename || '';

  // Thử từng pattern
  for (const pattern of INVOICE_PATTERNS) {
    // Thử trong subject trước
    const subjectMatch = subject.match(pattern);
    if (subjectMatch) {
      return subjectMatch[1] || subjectMatch[0];
    }

    // Thử trong filename
    const filenameMatch = filename.match(pattern);
    if (filenameMatch) {
      return filenameMatch[1] || filenameMatch[0];
    }
  }

  // Fallback: dùng tên file gốc (bỏ extension)
  const baseName = filename.replace(/\.(pdf|xml|zip)$/i, '').trim();
  return baseName || 'NoID';
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
