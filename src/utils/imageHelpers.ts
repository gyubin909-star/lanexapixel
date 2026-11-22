export async function fileToOptimizedDataUrl(
  file: File,
  maxDimension = 2048,
  quality = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        const MAX_DATA_URL_LENGTH = 3_400_000;
        const { width, height } = img;
        if (
          width <= maxDimension &&
          height <= maxDimension &&
          rawDataUrl.length <= MAX_DATA_URL_LENGTH
        ) {
          resolve(rawDataUrl);
          return;
        }
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const preferredMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        let result = canvas.toDataURL(preferredMime, quality);
        if (result.length > MAX_DATA_URL_LENGTH) {
          result = canvas.toDataURL('image/jpeg', 0.85);
        }
        if (result.length > MAX_DATA_URL_LENGTH) {
          result = canvas.toDataURL('image/jpeg', 0.72);
        }
        resolve(result);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadReferenceToServer(
  dataUrl: string,
  filename: string,
  mimeType: string
): Promise<string> {
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, filename, mimeType }),
  });

  if (!response.ok) {
    throw new Error('Gagal mengunggah gambar referensi.');
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error('Respons unggahan tidak mengembalikan URL.');
  }
  return data.url;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function triggerImageDownload(imageUrl: string, filename = 'lnxpixel-output.png') {
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('/src/')) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(
    filename
  )}`;
  const link = document.createElement('a');
  link.href = proxyUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
