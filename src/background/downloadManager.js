// ============================================================
// downloadManager.js — Quản lý download qua Chrome API
// ============================================================

/**
 * Tải file xuống qua Chrome Downloads API
 * 
 * Trong MV3 Service Worker không có DOM -> không dùng được URL.createObjectURL()
 * Giải pháp: chuyển data sang Offscreen Document hoặc dùng data URL
 * 
 * @param {ArrayBuffer} arrayBuffer - Nội dung file ZIP
 * @param {string} filename - Tên file tải về
 */
export async function downloadZipFile(arrayBuffer, filename) {
  // Chuyển ArrayBuffer sang base64 data URL
  const bytes = new Uint8Array(arrayBuffer);
  const base64 = arrayBufferToBase64(bytes);
  const dataUrl = `data:application/zip;base64,${base64}`;

  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename: filename,
        saveAs: true, // Cho user chọn vị trí lưu
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(downloadId);
      }
    );
  });
}

/**
 * Tải 1 file đơn lẻ (không qua ZIP)
 */
export async function downloadSingleFile(data, filename, mimeType = 'application/octet-stream') {
  const base64 = arrayBufferToBase64(data);
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename: filename,
        saveAs: false,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(downloadId);
      }
    );
  });
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function arrayBufferToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  // Xử lý theo chunk để tránh call stack exceeded với file lớn
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}
