import express, { type Express, type NextFunction, type Request, type Response } from 'express';

const UPSTREAM_BASE_URL = 'https://api.budgetpixel.com/v1';

const ALLOWED_MODELS = new Set([
  'nano-banana-2.1',
  'seedream-5.5',
  'kling-image-4.0',
  'grok-imagine-image-2',
  'gpt-image-2',
  'gpt-image-2.6-sunburst',
  'gpt-image-2.6-flare',
]);

interface CachedModelInfo {
  fetchedAt: number;
  data: unknown;
}

let modelCache: CachedModelInfo | null = null;

function getApiKey(): string {
  return (process.env.BUDGETPIXEL_API_KEY || '').trim();
}

function isKeyConfigured(): boolean {
  const key = getApiKey();
  return key.length > 0 && key !== 'MY_BUDGETPIXEL_API_KEY';
}

function sanitizeMessage(raw: string): string {
  return raw
    .replace(/budgetpixel\.com/gi, 'layanan-ai')
    .replace(/budgetpixel/gi, 'Server AI')
    .replace(/BUDGETPIXEL_API_KEY/gi, 'API_KEY');
}

function isSafeExternalHttpsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function parseErrorPayload(res: globalThis.Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      const nestedErr =
        json.error && typeof json.error === 'object'
          ? (json.error as Record<string, unknown>)
          : null;
      const msg =
        (typeof json.message === 'string' ? json.message : null) ??
        (typeof json.error === 'string' ? json.error : null) ??
        (typeof json.detail === 'string' ? json.detail : null) ??
        (nestedErr && typeof nestedErr.message === 'string' ? nestedErr.message : null);
      return sanitizeMessage(msg || text);
    } catch {
      return sanitizeMessage(text);
    }
  } catch {
    return `HTTP ${res.status}`;
  }
}

function buildModelPayload(
  modelId: string,
  body: Record<string, unknown>
): Record<string, unknown> {
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const aspectRatio = typeof body.aspect_ratio === 'string' ? body.aspect_ratio : undefined;
  const resolution = typeof body.resolution === 'string' ? body.resolution : undefined;
  const quality = typeof body.quality === 'string' ? body.quality : undefined;
  const outputFormat =
    typeof body.output_format === 'string' && body.output_format !== 'auto'
      ? body.output_format
      : undefined;
  const background = typeof body.background === 'string' ? body.background : undefined;
  const complexity = typeof body.complexity === 'string' ? body.complexity : undefined;
  const numImages = Math.min(4, Math.max(1, Number(body.num_images) || 1));

  const refs = Array.isArray(body.reference_images)
    ? body.reference_images
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 5)
    : [];

  switch (modelId) {
    case 'nano-banana-2.1': {
      const payload: Record<string, unknown> = { prompt };
      if (aspectRatio) payload.aspect_ratio = aspectRatio;
      if (resolution) payload.size = resolution;
      if (outputFormat === 'png' || outputFormat === 'jpeg') {
        payload.output_format = outputFormat;
      }
      if (numImages > 1) payload.num_images = numImages;
      if (refs.length > 0) payload.reference_images = refs;
      if (body.google_search === true) payload.google_search = true;
      if (body.image_search === true) payload.image_search = true;
      return payload;
    }

    case 'seedream-5.5': {
      const payload: Record<string, unknown> = { prompt };
      if (aspectRatio) payload.aspect_ratio = aspectRatio;
      if (resolution === '1K' || resolution === '2K') payload.size = resolution;
      if (background === 'transparent' || background === 'opaque') {
        payload.background = background;
      }
      if (outputFormat === 'png' || outputFormat === 'jpeg') {
        payload.output_format = background === 'transparent' ? 'png' : outputFormat;
      }
      if (numImages > 1) payload.num_images = numImages;
      if (refs.length > 0) payload.reference_images = refs;
      return payload;
    }

    case 'kling-image-4.0': {
      const payload: Record<string, unknown> = { prompt };
      if (aspectRatio) payload.aspect_ratio = aspectRatio;
      if (resolution === '2K' || resolution === '4K') payload.size = resolution;
      if (numImages > 1) payload.num_images = numImages;
      if (refs.length > 0) payload.reference_images = refs;
      return payload;
    }

    case 'grok-imagine-image-2': {
      const payload: Record<string, unknown> = { prompt };
      if (aspectRatio) payload.aspect_ratio = aspectRatio;
      if (resolution === '1K' || resolution === '2K') payload.size = resolution;
      if (quality === 'low' || quality === 'medium') payload.quality = quality;
      if (refs.length > 0) payload.image = refs[0];
      return payload;
    }

    case 'gpt-image-2': {
      const payload: Record<string, unknown> = { prompt };
      if (aspectRatio && aspectRatio !== 'auto') payload.aspect_ratio = aspectRatio;
      if (resolution) payload.resolution = resolution;
      if (quality === 'low' || quality === 'medium' || quality === 'high') {
        payload.quality = quality;
      }
      if (outputFormat === 'png' || outputFormat === 'jpeg') {
        payload.output_format = outputFormat;
      }
      if (numImages > 1) payload.num_images = numImages;
      if (refs.length > 0) payload.reference_images = refs;
      return payload;
    }

    case 'gpt-image-2.6-sunburst':
    case 'gpt-image-2.6-flare': {
      const payload: Record<string, unknown> = { prompt };
      if (aspectRatio) payload.aspect_ratio = aspectRatio;
      if (resolution) payload.resolution = resolution;
      if (quality) payload.quality = quality;
      if (complexity === 'low' || complexity === 'medium' || complexity === 'high') {
        payload.complexity = complexity;
      }
      if (background === 'auto' || background === 'opaque' || background === 'transparent') {
        payload.background = background;
      }
      if (outputFormat === 'png' || outputFormat === 'jpeg' || outputFormat === 'webp') {
        payload.output_format = outputFormat;
      }
      if (numImages > 1) payload.num_images = numImages;
      if (refs.length > 0) payload.reference_images = refs;
      return payload;
    }

    default:
      return { prompt };
  }
}

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: '60mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      configured: isKeyConfigured(),
    });
  });

  app.get('/api/credits', async (_req: Request, res: Response) => {
    if (!isKeyConfigured()) {
      res.json({
        configured: false,
        available: false,
        error: 'Kunci API belum dikonfigurasi pada environment server.',
      });
      return;
    }

    try {
      const upstream = await fetch(`${UPSTREAM_BASE_URL}/account/credits`, {
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
      });

      if (!upstream.ok) {
        const msg = await parseErrorPayload(upstream);
        res.status(upstream.status === 401 ? 200 : upstream.status).json({
          configured: true,
          available: false,
          error: msg,
        });
        return;
      }

      const data = (await upstream.json()) as Record<string, unknown>;
      res.json({
        configured: true,
        available: true,
        total_available: typeof data.total_available === 'number' ? data.total_available : 0,
        monthly_remaining: typeof data.monthly_remaining === 'number' ? data.monthly_remaining : 0,
        monthly_limit: typeof data.monthly_limit === 'number' ? data.monthly_limit : 0,
        monthly_used: typeof data.monthly_used === 'number' ? data.monthly_used : 0,
        extra_credits: typeof data.extra_credits === 'number' ? data.extra_credits : 0,
      });
    } catch {
      res.json({
        configured: true,
        available: false,
        error: 'Gagal mengambil data sisa kredit dari server.',
      });
    }
  });

  app.get('/api/model-spec', async (_req: Request, res: Response) => {
    if (!isKeyConfigured()) {
      res.json({ live: false });
      return;
    }

    if (modelCache && Date.now() - modelCache.fetchedAt < 5 * 60 * 1000) {
      res.json({ live: true, catalog: modelCache.data });
      return;
    }

    try {
      const upstream = await fetch(`${UPSTREAM_BASE_URL}/models?type=image`, {
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
      });
      if (!upstream.ok) {
        res.json({ live: false, status: upstream.status });
        return;
      }
      const catalog = await upstream.json();
      modelCache = { fetchedAt: Date.now(), data: catalog };
      res.json({ live: true, catalog });
    } catch {
      res.json({ live: false });
    }
  });

  app.post('/api/upload', async (req: Request, res: Response) => {
    const { dataUrl, filename, mimeType } = (req.body || {}) as {
      dataUrl?: string;
      filename?: string;
      mimeType?: string;
    };

    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Format gambar tidak valid.' });
      return;
    }

    if (!isKeyConfigured()) {
      res.json({ url: dataUrl, uploaded: false, mode: 'data-uri' });
      return;
    }

    try {
      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        res.json({ url: dataUrl, uploaded: false, mode: 'data-uri' });
        return;
      }

      const resolvedMime = mimeType || match[1];
      const buffer = Buffer.from(match[2], 'base64');
      const safeName = (filename || 'reference.png').replace(/[^a-zA-Z0-9._-]/g, '_');

      const formData = new FormData();
      const blob = new Blob([buffer], { type: resolvedMime });
      formData.append('file', blob, safeName);

      const upstream = await fetch(`${UPSTREAM_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: formData,
      });

      if (upstream.ok) {
        const result = (await upstream.json()) as Record<string, unknown>;
        const nestedData =
          result.data && typeof result.data === 'object'
            ? (result.data as Record<string, unknown>)
            : null;
        const uploadedUrl =
          (typeof result.url === 'string' && result.url) ||
          (typeof result.file_url === 'string' && result.file_url) ||
          (nestedData && typeof nestedData.url === 'string' && nestedData.url) ||
          null;

        if (uploadedUrl) {
          res.json({ url: uploadedUrl, uploaded: true, mode: 'cloud-upload' });
          return;
        }
      }

      res.json({ url: dataUrl, uploaded: false, mode: 'data-uri' });
    } catch {
      res.json({ url: dataUrl, uploaded: false, mode: 'data-uri' });
    }
  });

  app.post('/api/images/generate', async (req: Request, res: Response) => {
    if (!isKeyConfigured()) {
      res.status(400).json({
        error:
          'API key layanan belum dikonfigurasi pada server. Tambahkan kunci API pada pengaturan Environment Variables untuk mulai membuat gambar.',
      });
      return;
    }

    const body = (req.body || {}) as Record<string, unknown>;
    const modelId =
      typeof body.model === 'string' && ALLOWED_MODELS.has(body.model)
        ? body.model
        : 'nano-banana-2.1';

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({ error: 'Prompt deskripsi wajib diisi.' });
      return;
    }

    const payload = buildModelPayload(modelId, body);

    try {
      let upstream = await fetch(`${UPSTREAM_BASE_URL}/images/${modelId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!upstream.ok && (upstream.status === 400 || upstream.status === 422) && payload.num_images) {
        const errMsg = await parseErrorPayload(upstream);
        if (errMsg.toLowerCase().includes('num_images')) {
          const retryPayload = { ...payload };
          delete retryPayload.num_images;
          upstream = await fetch(`${UPSTREAM_BASE_URL}/images/${modelId}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getApiKey()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(retryPayload),
          });
        } else {
          res.status(upstream.status).json({ error: errMsg });
          return;
        }
      }

      if (!upstream.ok) {
        const errMsg = await parseErrorPayload(upstream);
        res.status(upstream.status).json({ error: errMsg });
        return;
      }

      const data = await upstream.json();
      res.json(data);
    } catch (err) {
      const message =
        err instanceof Error ? sanitizeMessage(err.message) : 'Gagal terhubung ke layanan generasi gambar.';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/images/:jobId', async (req: Request, res: Response) => {
    if (!isKeyConfigured()) {
      res.status(400).json({ error: 'API key layanan belum dikonfigurasi.' });
      return;
    }

    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
    if (!jobId || !/^[a-zA-Z0-9_-]{3,128}$/.test(jobId)) {
      res.status(400).json({ error: 'ID tugas tidak valid.' });
      return;
    }

    try {
      const upstream = await fetch(
        `${UPSTREAM_BASE_URL}/images/${encodeURIComponent(jobId)}`,
        {
          headers: {
            Authorization: `Bearer ${getApiKey()}`,
          },
        }
      );

      if (!upstream.ok) {
        const errMsg = await parseErrorPayload(upstream);
        res.status(upstream.status).json({ error: errMsg });
        return;
      }

      const data = await upstream.json();
      res.json(data);
    } catch (err) {
      const message =
        err instanceof Error ? sanitizeMessage(err.message) : 'Gagal memeriksa status generasi.';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/download', async (req: Request, res: Response) => {
    const targetUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const rawName = typeof req.query.filename === 'string' ? req.query.filename : 'lnxpixel-output.png';
    const safeFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!isSafeExternalHttpsUrl(targetUrl)) {
      res.status(400).json({ error: 'URL gambar tidak valid untuk diunduh.' });
      return;
    }

    try {
      const upstream = await fetch(targetUrl);
      if (!upstream.ok) {
        res.status(upstream.status).json({ error: 'Gagal mengambil gambar dari server CDN.' });
        return;
      }

      const contentType = upstream.headers.get('content-type') || 'image/png';
      const arrayBuffer = await upstream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch {
      res.status(502).json({ error: 'Terjadi kesalahan saat mengunduh gambar.' });
    }
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message =
      err instanceof Error ? sanitizeMessage(err.message) : 'Terjadi kesalahan internal server.';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  });

  return app;
}
