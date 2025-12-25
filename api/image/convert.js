import { convertImage } from '../lib/image-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/image/convert
 * Convert image to different format
 * Body: { url: string, format: string, quality?: number }
 */
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
    const { url, format = 'webp', quality = 90 } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    const validFormats = ['webp', 'jpeg', 'jpg', 'png', 'gif', 'tiff'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Valid formats: ${validFormats.join(', ')}`
      });
    }

    // Convert image
    const result = await convertImage(url, {
      format: format.toLowerCase(),
      quality: parseInt(quality)
    });

    // Upload result to Vercel Blob
    const ext = format === 'jpeg' ? 'jpg' : format;
    const filename = `converted-${Date.now()}.${ext}`;
    const blob = await uploadToBlob(
      result.buffer,
      filename,
      getContentType(format)
    );

    return res.status(200).json({
      success: true,
      downloadUrl: blob.url,
      filename,
      format: format.toUpperCase(),
      fileSize: result.buffer.length
    });

  } catch (error) {
    console.error('Image convert error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert image'
    });
  }
}

