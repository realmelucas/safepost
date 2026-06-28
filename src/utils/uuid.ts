/**
 * 安全生成 UUID v4
 * crypto.randomUUID() 仅在 HTTPS 或 localhost 下可用
 * 此函数提供兼容 HTTP 环境的 fallback
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  // fallback: crypto.getRandomValues
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 3);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
