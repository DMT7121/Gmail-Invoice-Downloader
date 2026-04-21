// ============================================================
// storageManager.js — Chrome Storage API wrapper
// ============================================================

import { STORAGE_KEYS } from './constants.js';

export const storage = {
  /**
   * Lấy giá trị từ chrome.storage.local
   */
  async get(key) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  },

  /**
   * Lưu giá trị vào chrome.storage.local
   */
  async set(key, value) {
    return chrome.storage.local.set({ [key]: value });
  },

  /**
   * Xóa key khỏi storage
   */
  async remove(key) {
    return chrome.storage.local.remove(key);
  },

  // -------------------------------------------------------
  // Download tracking — tránh tải trùng lặp
  // -------------------------------------------------------

  /**
   * Kiểm tra email đã được tải chưa
   */
  async isDownloaded(messageId) {
    const ids = (await this.get(STORAGE_KEYS.DOWNLOADED_IDS)) || [];
    return ids.includes(messageId);
  },

  /**
   * Đánh dấu danh sách email đã tải
   */
  async markAsDownloaded(messageIds) {
    const existing = (await this.get(STORAGE_KEYS.DOWNLOADED_IDS)) || [];
    const updated = [...new Set([...existing, ...messageIds])];
    return this.set(STORAGE_KEYS.DOWNLOADED_IDS, updated);
  },

  // -------------------------------------------------------
  // Scan history
  // -------------------------------------------------------

  /**
   * Thêm bản ghi lịch sử quét
   */
  async addScanRecord(record) {
    const history = (await this.get(STORAGE_KEYS.SCAN_HISTORY)) || [];
    history.unshift({
      ...record,
      timestamp: Date.now(),
    });
    // Giữ tối đa 100 bản ghi
    return this.set(STORAGE_KEYS.SCAN_HISTORY, history.slice(0, 100));
  },

  /**
   * Lấy danh sách lịch sử quét
   */
  async getScanHistory() {
    return (await this.get(STORAGE_KEYS.SCAN_HISTORY)) || [];
  },

  // -------------------------------------------------------
  // Scan checkpoint — phục hồi khi SW bị terminate
  // -------------------------------------------------------

  async saveCheckpoint(data) {
    return this.set(STORAGE_KEYS.SCAN_CHECKPOINT, data);
  },

  async getCheckpoint() {
    return this.get(STORAGE_KEYS.SCAN_CHECKPOINT);
  },

  async clearCheckpoint() {
    return this.remove(STORAGE_KEYS.SCAN_CHECKPOINT);
  },

  // -------------------------------------------------------
  // Scan results — lưu kết quả quét tạm
  // -------------------------------------------------------

  async saveScanResults(results) {
    return this.set(STORAGE_KEYS.SCAN_RESULTS, results);
  },

  async getScanResults() {
    return this.get(STORAGE_KEYS.SCAN_RESULTS);
  },

  async clearScanResults() {
    return this.remove(STORAGE_KEYS.SCAN_RESULTS);
  },

  // -------------------------------------------------------
  // User preferences
  // -------------------------------------------------------

  async getPreferences() {
    return (await this.get(STORAGE_KEYS.USER_PREFERENCES)) || {
      defaultKeywords: [],
      autoRename: true,
      groupBySupplier: true,
    };
  },

  async savePreferences(prefs) {
    return this.set(STORAGE_KEYS.USER_PREFERENCES, prefs);
  },
};
