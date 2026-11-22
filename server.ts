import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createApiApp } from './server/createApiApp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = createApiApp();

  const distPath = path.resolve(__dirname, 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isCompiledBundle = path.basename(__filename) === 'server.js';
  const isProduction =
    (process.env.NODE_ENV === 'production' || isCompiledBundle) && hasBuiltDist;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LNXPIXEL running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
