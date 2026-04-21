// ============================================================
// rateLimiter.js — Throttle requests + Exponential Backoff
// ============================================================

import { MAX_RETRIES, MAX_CONCURRENT_REQUESTS } from '../shared/constants.js';
import { sleep } from '../shared/utils.js';

/**
 * Rate Limiter với concurrent control và exponential backoff
 * 
 * @example
 * const limiter = new RateLimiter({ maxConcurrent: 5, delayMs: 200 });
 * const results = await limiter.executeAll(
 *   messageIds.map(id => () => gmailApi.getMessage(id))
 * );
 */
export class RateLimiter {
  constructor({
    maxConcurrent = MAX_CONCURRENT_REQUESTS,
    delayMs = 200,
    maxRetries = MAX_RETRIES,
  } = {}) {
    this.maxConcurrent = maxConcurrent;
    this.delayMs = delayMs;
    this.maxRetries = maxRetries;
    this.running = 0;
    this.queue = [];
    this.cancelled = false;
  }

  /**
   * Thực thi 1 task với retry logic
   */
  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, retries: 0 });
      this._processQueue();
    });
  }

  /**
   * Thực thi nhiều tasks song song (giới hạn concurrent)
   * @param {Function[]} tasks - Mảng các async functions
   * @param {Function} onProgress - Callback (completed, total)
   * @returns {Array} Kết quả
   */
  async executeAll(tasks, onProgress = null) {
    this.cancelled = false;
    let completed = 0;
    const total = tasks.length;

    const wrappedTasks = tasks.map((fn) => async () => {
      if (this.cancelled) throw new Error('Cancelled');
      const result = await fn();
      completed++;
      if (onProgress) onProgress(completed, total);
      return result;
    });

    const results = [];
    const executing = new Set();

    for (const task of wrappedTasks) {
      if (this.cancelled) break;

      const promise = this._executeWithRetry(task).then((result) => {
        executing.delete(promise);
        results.push(result);
      });

      executing.add(promise);

      if (executing.size >= this.maxConcurrent) {
        await Promise.race(executing);
      }

      await sleep(this.delayMs);
    }

    await Promise.allSettled(executing);
    return results;
  }

  /**
   * Hủy tất cả tasks đang chờ
   */
  cancel() {
    this.cancelled = true;
    this.queue = [];
  }

  // -------------------------------------------------------
  // Internal
  // -------------------------------------------------------

  async _executeWithRetry(fn, retries = 0) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && retries < this.maxRetries) {
        const backoff = Math.pow(2, retries) * 1000 + Math.random() * 500;
        console.warn(`[RateLimiter] 429 — retrying in ${Math.round(backoff)}ms (attempt ${retries + 1})`);
        await sleep(backoff);
        return this._executeWithRetry(fn, retries + 1);
      }
      throw error;
    }
  }

  async _processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      if (this.cancelled) return;

      const task = this.queue.shift();
      this.running++;

      this._executeWithRetry(task.fn)
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.running--;
          this._processQueue();
        });

      await sleep(this.delayMs);
    }
  }
}
