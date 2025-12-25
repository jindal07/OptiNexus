import { upscaleImage } from '../lib/image-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/image/upscale
 * Upscale image using high-quality interpolation
 * For AI upscaling, integrate with DeepAI or Replicate API
 * Body: { url: string, scale: number }
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
    const { url, scale = 2 } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    const validScales = [2, 4];
    if (!validScales.includes(parseInt(scale))) {
      return res.status(400).json({
        success: false,
        error: 'Scale must be 2 or 4'
      });
    }

    // Upscale image
    const result = await upscaleImage(url, parseInt(scale));

    // Upload result to Vercel Blob
    const filename = `upscaled-${scale}x-${Date.now()}.png`;
    const blob = await uploadToBlob(
      result.buffer,
      filename,
      getContentType('png')
    );

    return res.status(200).json({
      success: true,
      downloadUrl: blob.url,
      filename,
      originalDimensions: result.originalDimensions,
      newDimensions: result.newDimensions,
      scale: `${scale}x`,
      fileSize: result.buffer.length,
      note: 'Using Lanczos interpolation. For AI upscaling, integrate DeepAI or Replicate API.'
    });

  } catch (error) {
    console.error('Image upscale error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upscale image'
    });
  }
}

