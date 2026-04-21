// ============================================================
// attachmentProcessor.js — Phân tích MIME parts, trích xuất file đính kèm
// ============================================================

import { TARGET_FILE_EXTENSIONS } from '../shared/constants.js';
import { getHeader, getFileExtension, decodeBase64Url } from '../shared/utils.js';

/**
 * Trích xuất danh sách file đính kèm hợp lệ từ Gmail message
 * 
 * @param {Object} message - Gmail message object (format=full)
 * @returns {Array<AttachmentInfo>}
 */
export function extractAttachments(message) {
  const attachments = [];
  const parts = message.payload?.parts || [];

  // Nếu message không có parts (single part), kiểm tra trực tiếp payload
  if (parts.length === 0 && message.payload?.filename) {
    const att = checkPart(message.payload);
    if (att) attachments.push(att);
    return attachments;
  }

  // Duyệt đệ quy qua tất cả MIME parts
  walkParts(parts, attachments);
  return attachments;
}

/**
 * Duyệt đệ quy qua MIME parts (hỗ trợ multipart/mixed, multipart/related, etc.)
 */
function walkParts(parts, result) {
  for (const part of parts) {
    // Nested multipart
    if (part.parts) {
      walkParts(part.parts, result);
      continue;
    }

    const att = checkPart(part);
    if (att) result.push(att);
  }
}

/**
 * Kiểm tra 1 MIME part có phải file đính kèm hợp lệ không
 */
function checkPart(part) {
  const filename = part.filename;
  if (!filename || filename.trim() === '') return null;

  const ext = getFileExtension(filename);
  if (!TARGET_FILE_EXTENSIONS.includes(ext)) return null;

  return {
    filename: filename,
    mimeType: part.mimeType || 'application/octet-stream',
    size: part.body?.size || 0,
    attachmentId: part.body?.attachmentId || null,
    extension: ext,
    // Nếu data nhỏ có thể được inline trong body.data
    inlineData: part.body?.data || null,
  };
}

/**
 * Phân tích message và trả về thông tin đầy đủ cho hiển thị
 * 
 * @param {Object} message - Gmail message object
 * @returns {EmailInfo}
 */
export function parseEmailInfo(message) {
  const subject = getHeader(message, 'Subject') || '(Không có tiêu đề)';
  const from = getHeader(message, 'From') || '';
  const date = getHeader(message, 'Date') || '';
  const attachments = extractAttachments(message);

  // Parse tên người gửi
  const senderName = extractSenderName(from);
  const senderEmail = extractSenderEmail(from);

  return {
    id: message.id,
    threadId: message.threadId,
    subject: subject,
    from: from,
    senderName: senderName,
    senderEmail: senderEmail,
    date: date,
    internalDate: message.internalDate, // Unix timestamp ms
    snippet: message.snippet || '',
    attachments: attachments,
    attachmentCount: attachments.length,
    hasInvoiceFiles: attachments.length > 0,
    // Cảnh báo: có PDF nhưng thiếu XML (hoặc ngược lại)
    warnings: generateWarnings(attachments),
  };
}

/**
 * Ghép cặp các file PDF + XML cùng hóa đơn
 * Dựa trên tên file gốc (loại bỏ extension)
 */
export function pairInvoiceFiles(attachments) {
  const pairs = new Map();

  for (const att of attachments) {
    // Lấy base name không có extension
    const baseName = att.filename
      .replace(/\.(pdf|xml|zip)$/i, '')
      .trim()
      .toLowerCase();

    if (!pairs.has(baseName)) {
      pairs.set(baseName, { baseName, pdf: null, xml: null, zip: null });
    }

    const pair = pairs.get(baseName);
    if (att.extension === '.pdf') pair.pdf = att;
    else if (att.extension === '.xml') pair.xml = att;
    else if (att.extension === '.zip') pair.zip = att;
  }

  return Array.from(pairs.values());
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function extractSenderName(fromHeader) {
  // Format: "Tên Người Gửi <email@domain.com>" hoặc "email@domain.com"
  const match = fromHeader.match(/^"?(.+?)"?\s*</);
  if (match) return match[1].trim();

  // Fallback: lấy phần trước @
  const emailMatch = fromHeader.match(/^([^@]+)/);
  return emailMatch ? emailMatch[1].trim() : fromHeader;
}

function extractSenderEmail(fromHeader) {
  const match = fromHeader.match(/<(.+?)>/);
  if (match) return match[1];
  // Nếu không có <>, toàn bộ string có thể là email
  return fromHeader.includes('@') ? fromHeader.trim() : '';
}

function generateWarnings(attachments) {
  const warnings = [];
  const hasPdf = attachments.some((a) => a.extension === '.pdf');
  const hasXml = attachments.some((a) => a.extension === '.xml');
  const hasZip = attachments.some((a) => a.extension === '.zip');

  if (hasPdf && !hasXml && !hasZip) {
    warnings.push('Chỉ có file PDF, thiếu file XML gốc');
  }
  if (hasXml && !hasPdf) {
    warnings.push('Chỉ có file XML, thiếu bản thể hiện PDF');
  }

  return warnings;
}
