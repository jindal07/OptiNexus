import { mergePdfs } from '../lib/pdf-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/pdf/merge
 * Merge multiple PDFs into one
 * Body: { urls: string[] }
 */
export default async function handler(req, res) {
  // CORS headers
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
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 PDF URLs are required'
      });
    }

    if (urls.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 20 PDFs allowed per merge'
      });
    }

    // Merge PDFs
    const mergedBytes = await mergePdfs(urls);

    // Upload result to Vercel Blob
    const filename = `merged-${Date.now()}.pdf`;
    const result = await uploadToBlob(
      Buffer.from(mergedBytes),
      filename,
      getContentType('pdf')
    );

    return res.status(200).json({
      success: true,
      downloadUrl: result.url,
      filename,
      fileSize: mergedBytes.length,
      filesCount: urls.length
    });

  } catch (error) {
    console.error('PDF merge error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to merge PDFs'
    });
  }
}

