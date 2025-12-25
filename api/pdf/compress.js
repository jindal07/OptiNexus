import { compressPdf } from '../lib/pdf-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/pdf/compress
 * Compress PDF to reduce file size
 * Body: { url: string }
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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'PDF URL is required'
      });
    }

    // Compress PDF
    const { bytes, originalSize, compressedSize } = await compressPdf(url);

    // Upload result to Vercel Blob
    const filename = `compressed-${Date.now()}.pdf`;
    const result = await uploadToBlob(
      Buffer.from(bytes),
      filename,
      getContentType('pdf')
    );

    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    return res.status(200).json({
      success: true,
      downloadUrl: result.url,
      filename,
      originalSize,
      compressedSize,
      savings: `${savings}%`
    });

  } catch (error) {
    console.error('PDF compress error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to compress PDF'
    });
  }
}

