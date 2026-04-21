// ============================================================
// constants.js — Hằng số dùng chung toàn extension
// ============================================================

// Gmail API
export const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Định dạng file mục tiêu
export const TARGET_FILE_EXTENSIONS = ['.pdf', '.xml', '.zip'];
export const TARGET_MIME_TYPES = [
  'application/pdf',
  'text/xml',
  'application/xml',
  'application/zip',
  'application/x-zip-compressed',
];

// Từ khóa mặc định để tìm hóa đơn
export const DEFAULT_KEYWORDS = [
  'hóa đơn',
  'hoa don',
  'e-invoice',
  'einvoice',
  'GTGT',
  'invoice',
  'HDDT',
  'hóa đơn điện tử',
];

// Các nhà cung cấp hóa đơn phổ biến tại Việt Nam
export const KNOWN_INVOICE_PROVIDERS = [
  { name: 'MISA (meInvoice)', domains: ['meinvoice.vn', 'misa.com.vn'] },
  { name: 'VNPT', domains: ['vnpt.vn', 'hddt.vnpt.vn'] },
  { name: 'BKAV', domains: ['bkav.com', 'ehoadon.vn'] },
  { name: 'Viettel (S-Invoice)', domains: ['sinvoice.viettel.vn', 'viettel.vn'] },
  { name: 'FPT (EasyInvoice)', domains: ['fpt.com.vn'] },
  { name: 'CyberBill', domains: ['cyberbill.vn'] },
];

// Batch / Rate Limit
export const BATCH_SIZE = 50;
export const BATCH_DELAY_MS = 1000;
export const MAX_RETRIES = 3;
export const MAX_CONCURRENT_REQUESTS = 5;
export const PAGE_SIZE = 100;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  SCAN_HISTORY: 'scanHistory',
  DOWNLOADED_IDS: 'downloadedMessageIds',
  LAST_SCAN_DATE: 'lastScanDate',
  USER_PREFERENCES: 'userPreferences',
  SCAN_CHECKPOINT: 'scanCheckpoint',
  SCAN_RESULTS: 'scanResults',
};

// Popup dimensions
export const POPUP_WIDTH = 420;
export const POPUP_HEIGHT = 600;

// Invoice number patterns (regex)
export const INVOICE_PATTERNS = [
  /(?:HD|INV|HĐ|HDDT|C\d{2}[A-Z]{2,4})[\s\-_]?[\w\-]{4,}/i,
  /([A-Z0-9]{1,4}\d{2}[A-Z]{2,4}[\-_]\d{4,})/,
  /(\d{7,})/,
];

// Licensing & Admin
export const ADMIN_EMAIL = 'your-admin@email.com'; // CHỈNH SỬA TẠI ĐÂY

// Cấu hình Firebase - Đã được tự động thiết lập
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyANQvzNj4PB1_uwNLMTDUqXFjfHTyzVWfI",
  authDomain: "invoice-downloader-eda22.firebaseapp.com",
  projectId: "invoice-downloader-eda22",
  storageBucket: "invoice-downloader-eda22.firebasestorage.app",
  messagingSenderId: "1077638195559",
  appId: "1:1077638195559:web:9e00a71f00709fdb7127c2",
  measurementId: "G-13JYPZ9BWN"
};


