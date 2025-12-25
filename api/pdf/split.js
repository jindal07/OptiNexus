import { splitPdf } from '../lib/pdf-utils.js';
import { uploadToBlob, getContentType } from '../lib/blob-utils.js';

/**
 * POST /api/pdf/split
 * Split PDF into individual pages or ranges
 * Body: { url: string, ranges?: string }
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
    const { url, ranges = '' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'PDF URL is required'
      });
    }

    // Split PDF
    const { results, totalPages } = await splitPdf(url, ranges);

    // Upload each split PDF to Vercel Blob
    const uploadedFiles = await Promise.all(
      results.map(async (result, index) => {
        const filename = `split-page-${index + 1}-${Date.now()}.pdf`;
        const blob = await uploadToBlob(
          Buffer.from(result.bytes),
          filename,
          getContentType('pdf')
        );
        return {
          downloadUrl: blob.url,
          filename,
          pages: result.pages,
          fileSize: result.bytes.length
        };
      })
    );

    return res.status(200).json({
      success: true,
      files: uploadedFiles,
      totalFiles: uploadedFiles.length,
      originalPages: totalPages
    });

  } catch (error) {
    console.error('PDF split error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to split PDF'
    });
  }
}

