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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', async (req, res) => {
  const handler = (await import('./api/health.js')).default;
  return handler(req, res);
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  const handler = (await import('./api/upload.js')).default;
  return handler(req, res);
});

// Download endpoint
app.get('/api/download', async (req, res) => {
  const handler = (await import('./api/download.js')).default;
  return handler(req, res);
});

// Combined PDF endpoint with action query param
app.post('/api/pdf', async (req, res) => {
  const handler = (await import('./api/pdf.js')).default;
  return handler(req, res);
});

// Convert endpoint (CloudConvert)
app.post('/api/convert', async (req, res) => {
  const handler = (await import('./api/convert.js')).default;
  return handler(req, res);
});

app.get('/api/convert', async (req, res) => {
  const handler = (await import('./api/convert.js')).default;
  return handler(req, res);
});

// Combined Image endpoint with action query param
app.post('/api/image', async (req, res) => {
  const handler = (await import('./api/image.js')).default;
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

