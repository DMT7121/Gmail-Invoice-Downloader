// ============================================================
// offscreen.js — Offscreen Document cho xử lý Blob URL
// Dự phòng nếu data URL approach gặp giới hạn kích thước
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OFFSCREEN_DOWNLOAD') {
    handleDownload(message)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true; // Giữ sendResponse async
  }
});

async function handleDownload({ data, filename, mimeType }) {
  try {
    // Reconstruct Blob từ ArrayBuffer
    const arrayBuffer = new Uint8Array(data).buffer;
    const blob = new Blob([arrayBuffer], { type: mimeType || 'application/zip' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });

    // Cleanup sau khi download bắt đầu
    setTimeout(() => URL.revokeObjectURL(url), 60000);

    return { success: true, downloadId };
  } catch (err) {
    return { error: err.message };
  }
}
