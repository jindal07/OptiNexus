/**
 * Local development server for API
 * In production, Vercel handles routing to individual serverless functions
 */

// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';

// Log loaded env vars (without exposing full keys)
console.log('Environment loaded:');
console.log('  CLOUDCONVERT_API_KEY:', process.env.CLOUDCONVERT_API_KEY ? '✅ Set' : '❌ Not set');
console.log('  BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Not set (using local storage)');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Middleware
app.use(cors());

// Serve uploaded files statically (for local development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const handler = (await import('./api/health.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload endpoint - handle with multer
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Save file locally
    const uploadsDir = path.join(__dirname, 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}-${req.file.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, req.file.buffer);

    const localUrl = `http://localhost:${PORT}/uploads/${filename}`;

    return res.status(200).json({
      success: true,
      url: localUrl,
      pathname: filename,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download endpoint
app.get('/api/download', async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    // Check if it's a local file
    if (url.includes('localhost') && url.includes('/uploads/')) {
      const localFilename = url.split('/uploads/').pop();
      const filePath = path.join(__dirname, 'uploads', localFilename);

      try {
        const fileBuffer = await fs.readFile(filePath);
        const downloadName = filename || localFilename.split('-').slice(2).join('-') || localFilename;

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
        res.setHeader('Content-Length', fileBuffer.length);

        return res.send(fileBuffer);
      } catch (err) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }
    } else {
      // Remote file
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const downloadName = filename || url.split('/').pop() || 'download';

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.setHeader('Content-Length', buffer.length);

      return res.send(buffer);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// JSON body parser for other routes
app.use(express.json({ limit: '100mb' }));

// Combined PDF endpoint with action query param
app.post('/api/pdf', async (req, res) => {
  try {
    const handler = (await import('./api/pdf.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Convert endpoint (CloudConvert)
app.post('/api/convert', async (req, res) => {
  try {
    const handler = (await import('./api/convert.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/convert', async (req, res) => {
  try {
    const handler = (await import('./api/convert.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Combined Image endpoint with action query param
app.post('/api/image', async (req, res) => {
  try {
    const handler = (await import('./api/image.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('Image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cleanup endpoint (for testing and manual cleanup)
app.get('/api/cleanup', async (req, res) => {
  try {
    const handler = (await import('./api/cleanup.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cleanup', async (req, res) => {
  try {
    const handler = (await import('./api/cleanup.js')).default;
    return handler(req, res);
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Auto-cleanup timer for local development (runs every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function runLocalCleanup() {
  try {
    const { cleanupExpiredFiles, getFileTTLFormatted } = await import('./api/lib/blob-utils.js');
    const { deleted, errors } = await cleanupExpiredFiles();
    if (deleted > 0 || errors > 0) {
      console.log(`[Auto-Cleanup] Deleted: ${deleted} files, Errors: ${errors}`);
    }
  } catch (error) {
    console.error('[Auto-Cleanup] Error:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  // Get TTL for display
  let ttlDisplay = '30m';
  try {
    const { getFileTTLFormatted } = await import('./api/lib/blob-utils.js');
    ttlDisplay = getFileTTLFormatted();
  } catch (e) {}

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 OptiNexus API Server (Development)                   ║
║   📡 Port: ${PORT}                                          ║
║   🔗 http://localhost:${PORT}                               ║
║   🗑️  Auto-cleanup: Every 5 min (TTL: ${ttlDisplay.padEnd(4)})              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Start auto-cleanup timer
  setInterval(runLocalCleanup, CLEANUP_INTERVAL);
  
  // Run initial cleanup
  runLocalCleanup();
});
