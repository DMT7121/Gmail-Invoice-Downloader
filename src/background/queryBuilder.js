// ============================================================
// queryBuilder.js — Tạo Gmail search query string từ bộ lọc
// ============================================================

import { DEFAULT_KEYWORDS } from '../shared/constants.js';
import { formatDateForGmail } from '../shared/utils.js';

/**
 * Build chuỗi query tìm kiếm cho Gmail API
 * 
 * Ví dụ output:
 * "has:attachment (filename:pdf OR filename:xml OR filename:zip) 
 *  ("hóa đơn" OR "invoice" OR "GTGT") after:2024/1/1 before:2024/3/31"
 * 
 * @param {Object} filters - Bộ lọc từ người dùng
 * @param {string[]} filters.keywords - Danh sách từ khóa
 * @param {string|number} filters.dateFrom - Ngày bắt đầu
 * @param {string|number} filters.dateTo - Ngày kết thúc
 * @param {string[]} filters.fileTypes - Loại file (pdf, xml, zip)
 * @param {string} filters.sender - Email người gửi (tuỳ chọn)
 * @returns {string} Gmail search query
 */
export function buildGmailQuery(filters = {}) {
  const parts = [];

  // Luôn yêu cầu có file đính kèm
  parts.push('has:attachment');

  // === Lọc theo loại file ===
  const fileTypes = filters.fileTypes?.length
    ? filters.fileTypes
    : ['pdf', 'xml', 'zip'];

  const fileFilter = fileTypes
    .map((ft) => `filename:${ft.replace('.', '')}`)
    .join(' OR ');
  parts.push(`(${fileFilter})`);

  // === Lọc theo từ khóa ===
  const keywords = filters.keywords?.length
    ? filters.keywords
    : DEFAULT_KEYWORDS;

  if (keywords.length > 0) {
    const kwFilter = keywords.map((kw) => `"${kw}"`).join(' OR ');
    parts.push(`(${kwFilter})`);
  }

  // === Lọc theo thời gian ===
  if (filters.dateFrom) {
    parts.push(`after:${formatDateForGmail(filters.dateFrom)}`);
  }
  if (filters.dateTo) {
    // Gmail "before" là exclusive, thêm 1 ngày để bao gồm ngày kết thúc
    const nextDay = new Date(filters.dateTo);
    nextDay.setDate(nextDay.getDate() + 1);
    parts.push(`before:${formatDateForGmail(nextDay)}`);
  }

  // === Lọc theo người gửi ===
  if (filters.sender) {
    parts.push(`from:${filters.sender}`);
  }

  return parts.join(' ');
}

/**
 * Tạo query chỉ tìm file types cụ thể (không dùng keywords)
 * Hữu ích khi user muốn quét tất cả file đính kèm trong khoảng thời gian
 */
export function buildAttachmentOnlyQuery(filters = {}) {
  const parts = ['has:attachment'];

  const fileTypes = filters.fileTypes?.length
    ? filters.fileTypes
    : ['pdf', 'xml', 'zip'];

  const fileFilter = fileTypes
    .map((ft) => `filename:${ft.replace('.', '')}`)
    .join(' OR ');
  parts.push(`(${fileFilter})`);

  if (filters.dateFrom) {
    parts.push(`after:${formatDateForGmail(filters.dateFrom)}`);
  }
  if (filters.dateTo) {
    const nextDay = new Date(filters.dateTo);
    nextDay.setDate(nextDay.getDate() + 1);
    parts.push(`before:${formatDateForGmail(nextDay)}`);
  }

  return parts.join(' ');
}
