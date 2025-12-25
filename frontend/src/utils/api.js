const API_BASE = '/api';

/**
 * API endpoints mapping
 */
const ENDPOINTS = {
  'merge': '/pdf/merge',
  'split': '/pdf/split',
  'compress': '/pdf/compress',
  'rotate': '/pdf/rotate',
  'watermark': '/pdf/watermark',
  'pdf-to-docx': '/convert',
  'pdf-to-pptx': '/convert',
  'docx-to-pdf': '/convert',
  'pptx-to-pdf': '/convert',
  'image-compress': '/image/compress',
  'image-upscale': '/image/upscale',
  'image-resize': '/image/resize',
  'image-convert': '/image/convert',
};

/**
 * Process files via API
 * @param {string} toolId - Tool identifier
 * @param {string[]} urls - Array of uploaded file URLs
 * @param {object} options - Processing options
 * @param {Function} onProgress - Progress callback for polling
 * @returns {Promise<object>} Processing result
 */
export async function processFiles(toolId, urls, options = {}, onProgress) {
  const endpoint = ENDPOINTS[toolId];
  
  if (!endpoint) {
    throw new Error(`Unknown tool: ${toolId}`);
  }

  // Handle CloudConvert conversions with polling
  if (toolId.includes('-to-')) {
    return processConversion(toolId, urls[0], onProgress);
  }

  // Handle direct processing
  const body = toolId === 'merge' 
    ? { urls, ...options }
    : { url: urls[0], ...options };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Processing failed');
  }

  return response.json();
}

/**
 * Process document conversion with CloudConvert
 * Uses polling to check job status
 */
async function processConversion(type, url, onProgress) {
  // Start conversion job
  const startResponse = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type })
  });

  if (!startResponse.ok) {
    const error = await startResponse.json();
    throw new Error(error.error || 'Failed to start conversion');
  }

  const { jobId } = await startResponse.json();

  // Poll for completion
  return pollJobStatus(jobId, onProgress);
}

/**
 * Poll job status every 2 seconds
 */
async function pollJobStatus(jobId, onProgress, maxAttempts = 150) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${API_BASE}/convert?jobId=${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get job status');
    }

    const status = await response.json();

    if (onProgress) {
      onProgress(status.progress || 0);
    }

    if (status.status === 'finished' && status.downloadUrl) {
      return {
        success: true,
        downloadUrl: status.downloadUrl
      };
    }

    if (status.status === 'error') {
      throw new Error(status.error || 'Conversion failed');
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Conversion timed out');
}

/**
 * Check API health
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

/**
 * Download a file with proper Content-Disposition header
 * @param {string} url - The file URL
 * @param {string} filename - Optional filename for download
 */
export async function downloadFile(url, filename) {
  try {
    // Use the download API endpoint to get file with proper headers
    const downloadUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
    
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error('Download failed');
    }

    // Get the blob and create download link
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create invisible link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || getFilenameFromUrl(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL
    window.URL.revokeObjectURL(blobUrl);
    
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Extract filename from URL
 */
function getFilenameFromUrl(url) {
  const urlPath = url.split('/').pop() || 'download';
  // Remove timestamp prefix if present (e.g., "1234567890-abc123-filename.pdf")
  const parts = urlPath.split('-');
  if (parts.length > 2 && !isNaN(parts[0])) {
    return parts.slice(2).join('-');
  }
  return urlPath;
}
