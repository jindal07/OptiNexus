import { convertFileBuffer, getJobStatus, getConversionFormats } from './lib/cloudconvert.js';
import { uploadToBlob, getContentType } from './lib/blob-utils.js';
import { getSafeErrorMessage, getSafeErrorForLogging } from './lib/error-utils.js';

/**
 * POST /api/convert
 * Convert document using CloudConvert (PDF ↔ DOCX/PPTX)
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

  // GET request for job status polling (kept for compatibility)
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
      console.error('Job status error:', getSafeErrorForLogging(error));
      return res.status(500).json({
        success: false,
        error: getSafeErrorMessage(error) || 'Failed to get job status'
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

    // Download the file from URL first
    // Log only filename, not full URL (may contain sensitive data)
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'file';
    console.log(`Downloading file: ${filename}`);
    const fileResponse = await fetch(url);
    if (!fileResponse.ok) {
      return res.status(400).json({
        success: false,
        error: 'Failed to download file from URL'
      });
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    const originalFilename = url.split('/').pop() || `file.${formats.input}`;

    // Convert using CloudConvert with direct file upload
    console.log(`Starting CloudConvert conversion: ${formats.input} → ${formats.output}`);
    const result = await convertFileBuffer(
      fileBuffer,
      originalFilename,
      formats.input,
      formats.output
    );

    // Download the converted file and upload to our storage
    console.log(`Downloading converted file from CloudConvert`);
    const convertedResponse = await fetch(result.downloadUrl);
    const convertedBuffer = Buffer.from(await convertedResponse.arrayBuffer());

    // Upload to our storage (local or Vercel Blob)
    const outputFilename = `converted-${Date.now()}.${formats.output}`;
    const uploaded = await uploadToBlob(
      convertedBuffer,
      outputFilename,
      getContentType(formats.output)
    );

    // Log completion without exposing full URL
    console.log(`Conversion complete: ${outputFilename}`);

    return res.status(200).json({
      success: true,
      downloadUrl: uploaded.url,
      filename: outputFilename,
      originalFilename,
      type,
      inputFormat: formats.input,
      outputFormat: formats.output
    });

  } catch (error) {
    // Log safe error (no sensitive data)
    console.error('Conversion error:', getSafeErrorForLogging(error));
    
    // Provide more specific error messages (sanitized)
    const safeMessage = getSafeErrorMessage(error);
    let errorMessage = safeMessage || 'Failed to convert file';
    let statusCode = 500;
    
    // Check for 402 status (free limit reached)
    if (error.status === 402 || error.statusCode === 402 || 
        safeMessage?.includes('402') || 
        safeMessage?.toLowerCase().includes('limit') ||
        safeMessage?.toLowerCase().includes('quota')) {
      errorMessage = 'Free limit reached';
      statusCode = 402;
    } else if (safeMessage?.includes('Invalid scope')) {
      errorMessage = 'CloudConvert API key has insufficient permissions. Please regenerate your API key with task.read and task.write scopes.';
    } else if (safeMessage?.includes('FORBIDDEN')) {
      errorMessage = 'CloudConvert API access denied. Please check your API key permissions.';
    } else {
      // Generic error message to avoid exposing internal details
      errorMessage = 'Failed to convert file. Please try again.';
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
}
