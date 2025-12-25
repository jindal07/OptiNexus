import { resizeImage } from '../lib/image-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/image/resize
 * Resize image to specific dimensions
 * Body: { url: string, width?: number, height?: number, fit?: string }
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
    const { url, width, height, fit = 'cover' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    if (!width && !height) {
      return res.status(400).json({
        success: false,
        error: 'Either width or height is required'
      });
    }

    // Resize image
    const result = await resizeImage(url, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      fit
    });

    // Upload result to Vercel Blob
    const filename = `resized-${Date.now()}.png`;
    const blob = await uploadToBlob(
      result.buffer,
      filename,
      getContentType('png')
    );

    return res.status(200).json({
      success: true,
      downloadUrl: blob.url,
      filename,
      dimensions: `${result.width}x${result.height}`,
      fileSize: result.buffer.length
    });

  } catch (error) {
    console.error('Image resize error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to resize image'
    });
  }
}

