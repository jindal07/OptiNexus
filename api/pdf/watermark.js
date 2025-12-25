import { watermarkPdf } from '../lib/pdf-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/pdf/watermark
 * Add watermark to PDF
 * Body: { url: string, text?: string, opacity?: number, fontSize?: number, color?: string }
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
      text = 'CONFIDENTIAL',
      opacity = 0.3,
      fontSize = 50,
      color = '#888888'
    } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'PDF URL is required'
      });
    }

    // Add watermark to PDF
    const watermarkedBytes = await watermarkPdf(url, {
      text,
      opacity: parseFloat(opacity),
      fontSize: parseInt(fontSize),
      color
    });

    // Upload result to Vercel Blob
    const filename = `watermarked-${Date.now()}.pdf`;
    const result = await uploadToBlob(
      Buffer.from(watermarkedBytes),
      filename,
      getContentType('pdf')
    );

    return res.status(200).json({
      success: true,
      downloadUrl: result.url,
      filename,
      fileSize: watermarkedBytes.length,
      watermarkText: text
    });

  } catch (error) {
    console.error('PDF watermark error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add watermark'
    });
  }
}

