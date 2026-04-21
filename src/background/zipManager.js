// ============================================================
// zipManager.js — Đóng gói files thành ZIP
// ============================================================

import JSZip from 'jszip';

/**
 * ZipManager — Quản lý việc tạo file ZIP từ các attachments
 */
export class ZipManager {
  constructor() {
    this.zip = new JSZip();
    this.fileCount = 0;
    this.totalSize = 0;
  }

  /**
   * Thêm file vào root của ZIP
   * @param {string} filename - Tên file
   * @param {Uint8Array} data - Nội dung file (đã decoded)
   */
  addFile(filename, data) {
    this.zip.file(filename, data, { binary: true });
    this.fileCount++;
    this.totalSize += data.byteLength || 0;
  }

  /**
   * Thêm file vào sub-folder (nhóm theo nhà cung cấp)
   * @param {string} folderName - Tên folder
   * @param {string} filename - Tên file
   * @param {Uint8Array} data - Nội dung file
   */
  addFileToFolder(folderName, filename, data) {
    this.zip.folder(folderName).file(filename, data, { binary: true });
    this.fileCount++;
    this.totalSize += data.byteLength || 0;
  }

  /**
   * Tạo ZIP blob
   * @param {Function} onProgress - Callback (percent: number)
   * @returns {Blob} ZIP file as Blob
   */
  async generate(onProgress = null) {
    return this.zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        if (onProgress) {
          onProgress(Math.round(metadata.percent));
        }
      }
    );
  }

  /**
   * Tạo ZIP dạng ArrayBuffer (dùng cho message passing)
   */
  async generateArrayBuffer(onProgress = null) {
    return this.zip.generateAsync(
      {
        type: 'arraybuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        if (onProgress) {
          onProgress(Math.round(metadata.percent));
        }
      }
    );
  }

  getFileCount() {
    return this.fileCount;
  }

  getTotalSize() {
    return this.totalSize;
  }

  /**
   * Reset để tạo ZIP mới
   */
  reset() {
    this.zip = new JSZip();
    this.fileCount = 0;
    this.totalSize = 0;
  }
}
