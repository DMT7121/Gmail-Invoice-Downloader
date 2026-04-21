// ============================================================
// messageTypes.js — Enum cho message passing giữa Popup ↔ Service Worker
// ============================================================

export const MSG = {
  // === Auth ===
  AUTH_LOGIN:          'AUTH_LOGIN',
  AUTH_LOGOUT:         'AUTH_LOGOUT',
  AUTH_STATUS:         'AUTH_STATUS',
  AUTH_RESULT:         'AUTH_RESULT',

  // === Scan ===
  SCAN_START:          'SCAN_START',
  SCAN_PROGRESS:       'SCAN_PROGRESS',
  SCAN_COMPLETE:       'SCAN_COMPLETE',
  SCAN_ERROR:          'SCAN_ERROR',
  SCAN_CANCEL:         'SCAN_CANCEL',

  // === Download ===
  DOWNLOAD_START:      'DOWNLOAD_START',
  DOWNLOAD_PROGRESS:   'DOWNLOAD_PROGRESS',
  DOWNLOAD_COMPLETE:   'DOWNLOAD_COMPLETE',
  DOWNLOAD_ERROR:      'DOWNLOAD_ERROR',

  // === Offscreen ===
  OFFSCREEN_DOWNLOAD:  'OFFSCREEN_DOWNLOAD',
};
