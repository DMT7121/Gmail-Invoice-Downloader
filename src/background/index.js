// ============================================================
// background/index.js — Service Worker Entry Point
// Lắng nghe messages từ Popup và điều phối xử lý
// ============================================================

import { MSG } from '../shared/messageTypes.js';
import { storage } from '../shared/storageManager.js';
import { decodeBase64Url, formatDate } from '../shared/utils.js';
import { GmailApiClient } from './gmailApi.js';
import { buildGmailQuery } from './queryBuilder.js';
import { extractAttachments, parseEmailInfo } from './attachmentProcessor.js';
import { generateStandardFilename, identifySupplier } from './fileRenamer.js';
import { ZipManager } from './zipManager.js';
import { downloadZipFile } from './downloadManager.js';
import { BATCH_SIZE, BATCH_DELAY_MS } from '../shared/constants.js';
import { sleep } from '../shared/utils.js';

// ============================================================
// OAuth config
// ============================================================

const OAUTH_CLIENT_ID = '794880324306-fmehd6fcg5c3uj0njnlh0bb495h887a0.apps.googleusercontent.com';
const OAUTH_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Storage keys cho token
const TOKEN_KEY = 'oauth_access_token';
const TOKEN_EMAIL_KEY = 'oauth_email';

// ============================================================
// Message Listener — Router chính
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = messageHandlers[message.type];
  if (handler) {
    handler(message, sender)
      .then(sendResponse)
      .catch((err) => {
        console.error(`[BG] Error handling ${message.type}:`, err);
        sendResponse({ error: err.message, status: err.status });
      });
    return true; // Giữ sendResponse channel mở cho async
  }
});

// ============================================================
// Message Handlers
// ============================================================

const messageHandlers = {
  // ------- Auth -------
  [MSG.AUTH_LOGIN]: handleLogin,
  [MSG.AUTH_LOGOUT]: handleLogout,
  [MSG.AUTH_STATUS]: handleAuthStatus,

  // ------- Scan -------
  [MSG.SCAN_START]: handleScanStart,

  // ------- Download -------
  [MSG.DOWNLOAD_START]: handleDownloadStart,
};

// ============================================================
// TOKEN HELPERS — Lưu/lấy token từ chrome.storage
// ============================================================

async function saveToken(token, email) {
  await chrome.storage.local.set({
    [TOKEN_KEY]: token,
    [TOKEN_EMAIL_KEY]: email,
  });
}

async function getStoredToken() {
  const data = await chrome.storage.local.get([TOKEN_KEY, TOKEN_EMAIL_KEY]);
  return {
    token: data[TOKEN_KEY] || null,
    email: data[TOKEN_EMAIL_KEY] || null,
  };
}

async function clearToken() {
  await chrome.storage.local.remove([TOKEN_KEY, TOKEN_EMAIL_KEY]);
}

/**
 * Lấy token hiện tại. Kiểm tra còn hợp lệ không bằng cách gọi tokeninfo.
 */
async function getValidToken() {
  const { token } = await getStoredToken();
  if (!token) return null;

  try {
    // Kiểm tra token còn hợp lệ
    const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
    if (res.ok) {
      return token;
    }
    // Token hết hạn
    console.warn('[BG] Token expired, clearing...');
    await clearToken();
    return null;
  } catch {
    await clearToken();
    return null;
  }
}

// ============================================================
// AUTH HANDLERS — Dùng launchWebAuthFlow để chọn tài khoản
// ============================================================

async function handleLogin() {
  try {
    // Dùng launchWebAuthFlow — cho phép user chọn bất kỳ Google account nào
    const redirectUrl = chrome.identity.getRedirectURL();
    console.log('[BG] Redirect URL:', redirectUrl);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', OAUTH_SCOPES);
    authUrl.searchParams.set('prompt', 'select_account'); // Luôn hiện chọn tài khoản

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });

    if (!responseUrl) {
      return { success: false, error: 'Đăng nhập bị hủy' };
    }

    // Parse access_token từ URL fragment
    const hashFragment = responseUrl.split('#')[1];
    if (!hashFragment) {
      return { success: false, error: 'Không nhận được token từ Google' };
    }

    const params = new URLSearchParams(hashFragment);
    const accessToken = params.get('access_token');

    if (!accessToken) {
      return { success: false, error: 'Token không hợp lệ' };
    }

    // Lấy profile để hiển thị email
    const client = new GmailApiClient(accessToken);
    const profile = await client.getProfile();

    // Lưu token + email
    await saveToken(accessToken, profile.emailAddress);

    return {
      success: true,
      token: accessToken,
      email: profile.emailAddress,
      totalMessages: profile.messagesTotal,
    };
  } catch (err) {
    console.error('[BG] Login error:', err);
    return { success: false, error: err.message };
  }
}

async function handleLogout() {
  try {
    const { token } = await getStoredToken();

    if (token) {
      // Revoke token ở phía Google
      try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
      } catch (e) {
        console.warn('[BG] Revoke error (ignored):', e);
      }
    }

    // Xóa token khỏi storage
    await clearToken();

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function handleAuthStatus() {
  try {
    const token = await getValidToken();

    if (!token) {
      return { loggedIn: false };
    }

    const { email } = await getStoredToken();

    return {
      loggedIn: true,
      email: email || '',
    };
  } catch (err) {
    console.error('[BG] Auth status error:', err);
    return { loggedIn: false, error: err.message };
  }
}

// ============================================================
// SCAN HANDLER
// ============================================================

async function handleScanStart(message) {
  const { filters } = message;

  try {
    // 1. Lấy token
    const token = await getValidToken();
    if (!token) {
      return { success: false, error: 'Chưa đăng nhập. Vui lòng đăng nhập lại.' };
    }

    const client = new GmailApiClient(token);

    // 2. Build query
    const query = buildGmailQuery(filters);
    console.log('[BG] Gmail query:', query);

    // 3. List messages (có phân trang)
    broadcastProgress(MSG.SCAN_PROGRESS, {
      phase: 'listing',
      message: 'Đang tìm kiếm email...',
    });

    const messageList = await client.listMessages(query, (progress) => {
      broadcastProgress(MSG.SCAN_PROGRESS, {
        phase: 'listing',
        message: `Tìm thấy ${progress.found} email (trang ${progress.page})...`,
        found: progress.found,
      });
    });

    if (messageList.length === 0) {
      return {
        success: true,
        results: [],
        stats: { totalEmails: 0, totalFiles: 0, totalSize: 0 },
      };
    }

    // 4. Lấy chi tiết từng message (batch processing)
    broadcastProgress(MSG.SCAN_PROGRESS, {
      phase: 'processing',
      message: `Đang phân tích ${messageList.length} email...`,
      total: messageList.length,
      processed: 0,
    });

    const emailResults = [];
    let processedCount = 0;

    for (let i = 0; i < messageList.length; i += BATCH_SIZE) {
      const batch = messageList.slice(i, i + BATCH_SIZE);

      const batchDetails = await Promise.all(
        batch.map((msg) =>
          client.getMessage(msg.id).catch((err) => {
            console.warn(`[BG] Failed to get message ${msg.id}:`, err);
            return null;
          })
        )
      );

      for (const detail of batchDetails) {
        if (!detail || detail.error) continue;

        const emailInfo = parseEmailInfo(detail);
        if (emailInfo.attachmentCount > 0) {
          emailResults.push(emailInfo);
        }

        processedCount++;
      }

      broadcastProgress(MSG.SCAN_PROGRESS, {
        phase: 'processing',
        message: `Đã phân tích ${processedCount}/${messageList.length} email...`,
        total: messageList.length,
        processed: processedCount,
        foundFiles: emailResults.reduce((sum, e) => sum + e.attachmentCount, 0),
      });

      // Delay giữa các batch
      if (i + BATCH_SIZE < messageList.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // 5. Tính thống kê
    const totalFiles = emailResults.reduce((sum, e) => sum + e.attachmentCount, 0);
    const totalSize = emailResults.reduce(
      (sum, e) => sum + e.attachments.reduce((s, a) => s + a.size, 0),
      0
    );

    // 6. Lưu kết quả
    await storage.saveScanResults(emailResults);

    // 7. Lưu lịch sử
    await storage.addScanRecord({
      query: query,
      filters: filters,
      emailCount: emailResults.length,
      fileCount: totalFiles,
    });

    return {
      success: true,
      results: emailResults,
      stats: {
        totalEmails: emailResults.length,
        totalSearched: messageList.length,
        totalFiles: totalFiles,
        totalSize: totalSize,
      },
    };
  } catch (err) {
    console.error('[BG] Scan error:', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// DOWNLOAD HANDLER
// ============================================================

async function handleDownloadStart(message) {
  const { emailIds, allResults, groupBySupplier = true } = message;

  try {
    const token = await getValidToken();
    if (!token) {
      return { success: false, error: 'Chưa đăng nhập. Vui lòng đăng nhập lại.' };
    }

    const client = new GmailApiClient(token);

    // Lấy scan results đã lưu
    let results = allResults || (await storage.getScanResults()) || [];

    // Nếu có chọn email cụ thể, lọc
    if (emailIds && emailIds.length > 0) {
      results = results.filter((r) => emailIds.includes(r.id));
    }

    if (results.length === 0) {
      return { success: false, error: 'Không có file nào để tải' };
    }

    // Tạo ZIP
    const zipManager = new ZipManager();
    let downloadedCount = 0;
    const totalAttachments = results.reduce((sum, e) => sum + e.attachmentCount, 0);
    const downloadedMessageIds = [];

    for (const email of results) {
      for (const att of email.attachments) {
        try {
          broadcastProgress(MSG.DOWNLOAD_PROGRESS, {
            phase: 'downloading',
            message: `Đang tải: ${att.filename}`,
            current: downloadedCount + 1,
            total: totalAttachments,
            percent: Math.round(((downloadedCount + 1) / totalAttachments) * 100),
          });

          // Lấy attachment data
          let fileData;
          if (att.inlineData) {
            fileData = decodeBase64Url(att.inlineData);
          } else if (att.attachmentId) {
            const attData = await client.getAttachment(email.id, att.attachmentId);
            fileData = decodeBase64Url(attData.data);
          } else {
            console.warn(`[BG] No data for attachment: ${att.filename}`);
            continue;
          }

          // Đổi tên file
          const newFilename = generateStandardFilename(email, att);

          // Thêm vào ZIP
          if (groupBySupplier) {
            const supplierFolder = identifySupplier(email);
            zipManager.addFileToFolder(supplierFolder, newFilename, fileData);
          } else {
            zipManager.addFile(newFilename, fileData);
          }

          downloadedCount++;
        } catch (err) {
          console.warn(`[BG] Failed to download attachment ${att.filename}:`, err);
        }

        await sleep(200); // Nhẹ delay giữa các attachment
      }

      downloadedMessageIds.push(email.id);
    }

    if (zipManager.getFileCount() === 0) {
      return { success: false, error: 'Không tải được file nào' };
    }

    // Tạo ZIP
    broadcastProgress(MSG.DOWNLOAD_PROGRESS, {
      phase: 'zipping',
      message: 'Đang đóng gói ZIP...',
      percent: 0,
    });

    const zipArrayBuffer = await zipManager.generateArrayBuffer((percent) => {
      broadcastProgress(MSG.DOWNLOAD_PROGRESS, {
        phase: 'zipping',
        message: `Đang đóng gói ZIP... ${percent}%`,
        percent: percent,
      });
    });

    // Tải ZIP
    const today = formatDate(Date.now());
    const zipFilename = `HoaDon_${today}_${zipManager.getFileCount()}files.zip`;

    broadcastProgress(MSG.DOWNLOAD_PROGRESS, {
      phase: 'saving',
      message: 'Đang lưu file...',
    });

    await downloadZipFile(zipArrayBuffer, zipFilename);

    // Đánh dấu đã tải
    await storage.markAsDownloaded(downloadedMessageIds);

    return {
      success: true,
      filename: zipFilename,
      fileCount: zipManager.getFileCount(),
      totalSize: zipManager.getTotalSize(),
    };
  } catch (err) {
    console.error('[BG] Download error:', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// BROADCAST HELPER
// ============================================================

function broadcastProgress(type, data) {
  chrome.runtime.sendMessage({ type, ...data }).catch(() => {
    // Popup có thể đã đóng — bỏ qua lỗi
  });
}

// ============================================================
// INSTALL EVENT
// ============================================================

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[BG] Extension installed:', details.reason);
});
