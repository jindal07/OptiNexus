import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're in local development mode
const isLocalDev = !process.env.BLOB_READ_WRITE_TOKEN;

/**
 * POST /api/upload
 * Upload file to Vercel Blob or local storage
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const chunks = [];
    
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Parse the multipart data to extract file
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    
    if (!boundary) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content type - expected multipart/form-data'
      });
    }

    // Simple multipart parser
    const parts = parseMultipart(buffer, boundary);
    const filePart = parts.find(p => p.filename);

    if (!filePart) {
      return res.status(400).json({
        success: false,
        error: 'No file found in request'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}-${filePart.filename}`;

    if (isLocalDev) {
      // Local development: save to uploads folder
      const uploadsDir = path.join(__dirname, '../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, filePart.data);
      
      const localUrl = `http://localhost:3001/uploads/${filename}`;
      
      return res.status(200).json({
        success: true,
        url: localUrl,
        pathname: filename,
        filename: filePart.filename,
        size: filePart.data.length
      });
    }

    // Production: use Vercel Blob
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, filePart.data, {
      access: 'public',
      contentType: filePart.contentType || 'application/octet-stream',
      addRandomSuffix: false
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      filename: filePart.filename,
      size: filePart.data.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
}

/**
 * Simple multipart form data parser
 */
function parseMultipart(buffer, boundary) {
  const parts = [];
  const str = buffer.toString('binary');
  
  // Split by boundary
  const rawParts = str.split(`--${boundary}`);
  
  for (const rawPart of rawParts) {
    if (rawPart.trim() === '' || rawPart.trim() === '--') continue;
    
    // Find the header/body separator (double CRLF)
    const headerEndIndex = rawPart.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) continue;
    
    const headerSection = rawPart.substring(0, headerEndIndex);
    const bodySection = rawPart.substring(headerEndIndex + 4);
    
    // Parse headers
    const headers = {};
    const headerLines = headerSection.split('\r\n');
    
    for (const line of headerLines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
    
    // Extract filename and content type from Content-Disposition
    let filename = null;
    let name = null;
    
    const disposition = headers['content-disposition'];
    if (disposition) {
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      if (filenameMatch) filename = filenameMatch[1];
      
      const nameMatch = disposition.match(/name="([^"]+)"/);
      if (nameMatch) name = nameMatch[1];
    }
    
    // Remove trailing CRLF from body
    let body = bodySection;
    if (body.endsWith('\r\n')) {
      body = body.slice(0, -2);
    }
    
    parts.push({
      name,
      filename,
      contentType: headers['content-type'],
      data: Buffer.from(body, 'binary')
    });
  }
  
  return parts;
}
