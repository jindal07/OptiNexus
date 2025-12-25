/**
 * Local development server for API
 * In production, Vercel handles routing to individual serverless functions
 */
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));

// Serve uploaded files statically (for local development)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', async (req, res) => {
  const handler = (await import('./health.js')).default;
  return handler(req, res);
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  const handler = (await import('./upload.js')).default;
  return handler(req, res);
});

// Download endpoint
app.get('/api/download', async (req, res) => {
  const handler = (await import('./download.js')).default;
  return handler(req, res);
});

// PDF endpoints
app.post('/api/pdf/merge', async (req, res) => {
  const handler = (await import('./pdf/merge.js')).default;
  return handler(req, res);
});

app.post('/api/pdf/split', async (req, res) => {
  const handler = (await import('./pdf/split.js')).default;
  return handler(req, res);
});

app.post('/api/pdf/compress', async (req, res) => {
  const handler = (await import('./pdf/compress.js')).default;
  return handler(req, res);
});

app.post('/api/pdf/rotate', async (req, res) => {
  const handler = (await import('./pdf/rotate.js')).default;
  return handler(req, res);
});

app.post('/api/pdf/watermark', async (req, res) => {
  const handler = (await import('./pdf/watermark.js')).default;
  return handler(req, res);
});

// Convert endpoint (CloudConvert)
app.post('/api/convert', async (req, res) => {
  const handler = (await import('./convert.js')).default;
  return handler(req, res);
});

app.get('/api/convert', async (req, res) => {
  const handler = (await import('./convert.js')).default;
  return handler(req, res);
});

// Image endpoints
app.post('/api/image/compress', async (req, res) => {
  const handler = (await import('./image/compress.js')).default;
  return handler(req, res);
});

app.post('/api/image/resize', async (req, res) => {
  const handler = (await import('./image/resize.js')).default;
  return handler(req, res);
});

app.post('/api/image/convert', async (req, res) => {
  const handler = (await import('./image/convert.js')).default;
  return handler(req, res);
});

app.post('/api/image/upscale', async (req, res) => {
  const handler = (await import('./image/upscale.js')).default;
  return handler(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 PDF-Flow API Server (Development)                    ║
║   📡 Port: ${PORT}                                          ║
║   🔗 http://localhost:${PORT}                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

