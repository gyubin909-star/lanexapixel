import type { Request, Response } from 'express';
import { createApiApp } from '../server/createApiApp';

const app = createApiApp();

export default function handler(req: Request, res: Response) {
  const parsed = new URL(req.url || '/', 'http://localhost');
  const subPath = parsed.searchParams.get('__path');
  parsed.searchParams.delete('__path');

  if ((parsed.pathname === '/api' || parsed.pathname === '/') && subPath) {
    parsed.pathname = `/api/${subPath.replace(/^\/+/, '')}`;
  }

  req.url = `${parsed.pathname}${parsed.search}`;
  return app(req, res);
}
