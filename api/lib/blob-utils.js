import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're in local development mode (no Vercel Blob token)
const isLocalDev = !process.env.BLOB_READ_WRITE_TOKEN;

// Auto-delete configuration (30 minutes = 1800000ms)
const FILE_TTL_MS = parseInt(process.env.FILE_TTL_MS) || 30 * 60 * 1000;

/**
 * Upload buffer to storage (Vercel Blob or local filesystem)
 * @param {Buffer|Uint8Array} buffer - File buffer
 * @param {string} filename - Filename to use
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadToBlob(buffer, filename, contentType) {
  if (isLocalDev) {
    // Local development: save to uploads folder
    const uploadsDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const safeFilename = `${timestamp}-${random}-${filename}`;
    const filePath = path.join(uploadsDir, safeFilename);
    
    await fs.writeFile(filePath, buffer);
    
    // Return local URL that can be served by Express
    const localUrl = `http://localhost:3001/uploads/${safeFilename}`;
    
    return {
      url: localUrl,
      pathname: safeFilename
    };
  }
  
  // Production: use Vercel Blob
  const { put } = await import('@vercel/blob');
  const blob = await put(filename, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true
  });

  return {
    url: blob.url,
    pathname: blob.pathname
  };
}

/**
 * Delete a blob by URL
 * @param {string} url - Blob URL
 */
export async function deleteBlob(url) {
  try {
    if (isLocalDev) {
      // Local development: delete from uploads folder
      const filename = url.split('/uploads/').pop();
      const filePath = path.join(__dirname, '../../uploads', filename);
      await fs.unlink(filePath);
      return { success: true };
    }
    
    // Production: use Vercel Blob
    const { del } = await import('@vercel/blob');
    await del(url);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete blob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get content type from format
 */
export function getContentType(format) {
  const contentTypes = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'doc': 'application/msword',
    'ppt': 'application/vnd.ms-powerpoint',
    'webp': 'image/webp',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'tiff': 'image/tiff'
  };

  return contentTypes[format.toLowerCase()] || 'application/octet-stream';
}

/**
 * Get file extension from content type
 */
export function getExtension(contentType) {
  const extensions = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/msword': 'doc',
    'application/vnd.ms-powerpoint': 'ppt',
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/tiff': 'tiff'
  };

  return extensions[contentType] || 'bin';
}

/**
 * Clean up expired files from storage
 * @returns {Promise<{deleted: number, errors: number}>}
 */
export async function cleanupExpiredFiles() {
  const now = Date.now();
  let deleted = 0;
  let errors = 0;

  if (isLocalDev) {
    // Local development: clean up old files from uploads folder
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      // Check if uploads directory exists
      try {
        await fs.access(uploadsDir);
      } catch {
        // Directory doesn't exist, nothing to clean
        return { deleted: 0, errors: 0 };
      }

      const files = await fs.readdir(uploadsDir);
      
      for (const file of files) {
        try {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          const fileAge = now - stats.mtimeMs;
          
          if (fileAge > FILE_TTL_MS) {
            await fs.unlink(filePath);
            deleted++;
            console.log(`[Cleanup] Deleted expired file: ${file}`);
          }
        } catch (err) {
          console.error(`[Cleanup] Error deleting file ${file}:`, err.message);
          errors++;
        }
      }
    } catch (err) {
      console.error('[Cleanup] Error reading uploads directory:', err.message);
      errors++;
    }
  } else {
    // Production: clean up old files from Vercel Blob
    try {
      const { list, del } = await import('@vercel/blob');
      
      let cursor;
      do {
        const { blobs, cursor: nextCursor } = await list({ cursor, limit: 100 });
        cursor = nextCursor;
        
        for (const blob of blobs) {
          try {
            const uploadedAt = new Date(blob.uploadedAt).getTime();
            const fileAge = now - uploadedAt;
            
            if (fileAge > FILE_TTL_MS) {
              await del(blob.url);
              deleted++;
              console.log(`[Cleanup] Deleted expired blob: ${blob.pathname}`);
            }
          } catch (err) {
            console.error(`[Cleanup] Error deleting blob ${blob.pathname}:`, err.message);
            errors++;
          }
        }
      } while (cursor);
    } catch (err) {
      console.error('[Cleanup] Error listing blobs:', err.message);
      errors++;
    }
  }

  return { deleted, errors };
}

/**
 * Get the configured TTL in milliseconds
 */
export function getFileTTL() {
  return FILE_TTL_MS;
}

/**
 * Get the configured TTL in human-readable format
 */
export function getFileTTLFormatted() {
  const minutes = Math.floor(FILE_TTL_MS / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}
