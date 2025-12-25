import { createConversionJob, getJobStatus, getConversionFormats } from './lib/cloudconvert.js';

/**
 * POST /api/convert
 * Start a document conversion job using CloudConvert
 * Body: { url: string, type: string }
 * Types: pdf-to-docx, pdf-to-pptx, docx-to-pdf, pptx-to-pdf
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET request for job status polling
  if (req.method === 'GET') {
    try {
      const { jobId } = req.query;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
      }

      const status = await getJobStatus(jobId);

      return res.status(200).json({
        success: true,
        ...status
      });

    } catch (error) {
      console.error('Job status error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get job status'
      });
    }
  }

  // POST request to start conversion
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { url, type } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'File URL is required'
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Conversion type is required'
      });
    }

    const formats = getConversionFormats(type);
    if (!formats) {
      return res.status(400).json({
        success: false,
        error: `Invalid conversion type: ${type}. Valid types: pdf-to-docx, pdf-to-pptx, docx-to-pdf, pptx-to-pdf`
      });
    }

    // Check for API key
    if (!process.env.CLOUDCONVERT_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'CloudConvert API key not configured. Please add CLOUDCONVERT_API_KEY to your environment variables.'
      });
    }

    // Create conversion job
    const { jobId, status } = await createConversionJob(
      url,
      formats.input,
      formats.output
    );

    return res.status(200).json({
      success: true,
      jobId,
      status,
      type,
      message: 'Conversion started. Poll /api/convert?jobId=<jobId> for status.'
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to start conversion'
    });
  }
}

