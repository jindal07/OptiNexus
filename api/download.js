import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/download
 * Download a file with proper Content-Disposition header
 * Query params: url (the file URL), filename (optional download name)
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    // Check if it's a local file (development) or remote URL (production)
    if (url.includes('localhost:3001/uploads/')) {
      // Local file - read from uploads folder
      const localFilename = url.split('/uploads/').pop();
      const filePath = path.join(__dirname, '../uploads', localFilename);
      
      try {
        const fileBuffer = await fs.readFile(filePath);
        const downloadName = filename || localFilename.split('-').slice(2).join('-') || localFilename;
        
        // Set headers for download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        return res.send(fileBuffer);
      } catch (err) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }
    } else {
      // Remote file - fetch and stream
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const downloadName = filename || url.split('/').pop() || 'download';
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.setHeader('Content-Length', buffer.length);
      
      return res.send(buffer);
    }

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Download failed'
    });
  }
}

