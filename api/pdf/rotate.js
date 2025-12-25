import { rotatePdf } from '../lib/pdf-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/pdf/rotate
 * Rotate PDF pages
 * Body: { url: string, angle: number, pages?: string }
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
    const { url, angle = 90, pages = 'all' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'PDF URL is required'
      });
    }

    // Validate angle
    const validAngles = [90, 180, 270, -90, -180, -270];
    if (!validAngles.includes(parseInt(angle))) {
      return res.status(400).json({
        success: false,
        error: 'Angle must be 90, 180, or 270 degrees'
      });
    }

    // Rotate PDF
    const rotatedBytes = await rotatePdf(url, parseInt(angle), pages);

    // Upload result to Vercel Blob
    const filename = `rotated-${Date.now()}.pdf`;
    const result = await uploadToBlob(
      Buffer.from(rotatedBytes),
      filename,
      getContentType('pdf')
    );

    return res.status(200).json({
      success: true,
      downloadUrl: result.url,
      filename,
      fileSize: rotatedBytes.length,
      rotationAngle: angle
    });

  } catch (error) {
    console.error('PDF rotate error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to rotate PDF'
    });
  }
}

