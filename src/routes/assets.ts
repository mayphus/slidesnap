import { Hono } from 'hono';

const assets = new Hono();

// Static assets will be handled by Cloudflare Workers static assets feature
// This route is a placeholder for future static file handling
assets.get('/assets/*', (c) => {
  return c.text('Static assets handled by Cloudflare Workers', 404);
});

export { assets };