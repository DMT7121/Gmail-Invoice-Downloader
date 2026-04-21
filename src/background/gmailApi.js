// ============================================================
// gmailApi.js — Gmail REST API Client
// ============================================================

import { GMAIL_API_BASE, PAGE_SIZE } from '../shared/constants.js';
import { sleep } from '../shared/utils.js';

/**
 * Gmail API Client
 * Quản lý tất cả tương tác với Gmail REST API
 */
export class GmailApiClient {
  constructor(token) {
    this.token = token;
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Gọi API với error handling
   */
  async _fetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    if (response.status === 401) {
      throw new ApiError(401, 'Token hết hạn. Vui lòng đăng nhập lại.');
    }

    if (response.status === 429) {
      throw new ApiError(429, 'Vượt giới hạn API. Đang chờ...');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(response.status, text);
    }

    return response.json();
  }

  // -------------------------------------------------------
  // Messages
  // -------------------------------------------------------

  /**
   * Liệt kê message IDs theo query, có phân trang
   * @param {string} query - Gmail search query
   * @param {Function} onProgress - Callback báo tiến trình (totalFound)
   * @returns {Array<{id: string, threadId: string}>}
   */
  async listMessages(query, onProgress = null) {
    const allMessages = [];
    let pageToken = null;
    let pageCount = 0;

    do {
      const params = new URLSearchParams({
        q: query,
        maxResults: String(PAGE_SIZE),
      });
      if (pageToken) {
        params.set('pageToken', pageToken);
      }

      const data = await this._fetch(
        `${GMAIL_API_BASE}/messages?${params.toString()}`
      );

      if (data.messages) {
        allMessages.push(...data.messages);
      }

      pageToken = data.nextPageToken || null;
      pageCount++;

      if (onProgress) {
        onProgress({
          found: allMessages.length,
          page: pageCount,
          estimatedTotal: data.resultSizeEstimate || allMessages.length,
        });
      }

      // Delay nhẹ giữa các page để tránh rate limit
      if (pageToken) {
        await sleep(300);
      }
    } while (pageToken);

    return allMessages;
  }

  /**
   * Lấy chi tiết 1 message (bao gồm payload với MIME parts)
   * @param {string} messageId
   * @param {string} format - 'full' | 'metadata' | 'minimal'
   * @returns {Object} Gmail message object
   */
  async getMessage(messageId, format = 'full') {
    return this._fetch(
      `${GMAIL_API_BASE}/messages/${messageId}?format=${format}`
    );
  }

  /**
   * Lấy chi tiết nhiều messages (batch xử lý tuần tự với delay)
   * @param {string[]} messageIds - Danh sách message IDs
   * @param {number} batchSize - Số messages mỗi batch
   * @param {number} delayMs - Delay giữa các batch (ms)
   * @param {Function} onProgress - Callback tiến trình
   * @returns {Object[]} Danh sách message details
   */
  async getMessagesBatch(messageIds, batchSize = 50, delayMs = 500, onProgress = null) {
    const results = [];

    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      
      // Xử lý song song trong mỗi batch (giới hạn concurrent)
      const batchResults = await Promise.all(
        batch.map((id) => this.getMessage(id).catch((err) => ({ id, error: err.message })))
      );

      results.push(...batchResults);

      if (onProgress) {
        onProgress({
          processed: results.length,
          total: messageIds.length,
          percent: Math.round((results.length / messageIds.length) * 100),
        });
      }

      // Delay giữa các batch
      if (i + batchSize < messageIds.length) {
        await sleep(delayMs);
      }
    }

    return results;
  }

  // -------------------------------------------------------
  // Attachments
  // -------------------------------------------------------

  /**
   * Lấy dữ liệu attachment (Base64URL encoded)
   * @param {string} messageId
   * @param {string} attachmentId
   * @returns {{ data: string, size: number }}
   */
  async getAttachment(messageId, attachmentId) {
    return this._fetch(
      `${GMAIL_API_BASE}/messages/${messageId}/attachments/${attachmentId}`
    );
  }

  // -------------------------------------------------------
  // Profile
  // -------------------------------------------------------

  /**
   * Lấy thông tin profile user
   * @returns {{ emailAddress: string, messagesTotal: number }}
   */
  async getProfile() {
    return this._fetch(`${GMAIL_API_BASE}/profile`);
  }
}

/**
 * Custom Error class cho API errors
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
