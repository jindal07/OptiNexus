import { compressImage } from '../lib/image-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/image/compress
 * Compress image with quality and format options
 * Body: { url: string, quality?: number, format?: string, maxWidth?: number, maxHeight?: number }
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
    const { 
      url, 
      quality = 80, 
      format = 'webp',
      maxWidth,
      maxHeight 
    } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    // Compress image
    const { buffer, originalSize, compressedSize, format: outputFormat } = await compressImage(url, {
      quality: parseInt(quality),
      format,
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined
    });

    // Upload result to Vercel Blob
    const filename = `compressed-${Date.now()}.${outputFormat}`;
    const result = await uploadToBlob(
      buffer,
      filename,
      getContentType(outputFormat)
    );

    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    return res.status(200).json({
      success: true,
      downloadUrl: result.url,
      filename,
      originalSize,
      compressedSize,
      savings: `${savings}%`,
      format: outputFormat
    });

  } catch (error) {
    console.error('Image compress error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to compress image'
    });
  }
}

