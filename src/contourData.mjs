export const MAX_RUN_AGE_MS = 36 * 60 * 60 * 1000;

export async function decodeFrameResponse(response) {
  if (typeof DecompressionStream === 'undefined') throw Error('This browser does not support compressed forecast files');
  const compressed = new Uint8Array(await response.arrayBuffer());
  if (compressed.byteLength > 2 * 1024 * 1024) throw Error('Compressed forecast exceeds size limit');
  const reader = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const parts = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) throw Error('Decoded forecast exceeds size limit');
      parts.push(value);
    }
  } finally { await reader.cancel(); }
  const joined = new Uint8Array(size); let offset = 0;
  for (const part of parts) { joined.set(part, offset); offset += part.byteLength; }
  return JSON.parse(new TextDecoder().decode(joined));
}
