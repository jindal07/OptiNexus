const API_BASE = '/api';

/**
 * API endpoints mapping - consolidated for Vercel Hobby plan (12 function limit)
 */
const ENDPOINTS = {
  'merge': '/pdf?action=merge',
  'split': '/pdf?action=split',
  'compress': '/pdf?action=compress',
  'rotate': '/pdf?action=rotate',
  'watermark': '/pdf?action=watermark',
  'pdf-to-docx': '/convert',
  'pdf-to-pptx': '/convert',
  'docx-to-pdf': '/convert',
  'pptx-to-pdf': '/convert',
  'image-compress': '/image?action=compress',
  'image-upscale': '/image?action=upscale',
  'image-resize': '/image?action=resize',
  'image-convert': '/image?action=convert',
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
 * Now uses synchronous conversion (server handles the full flow)
 */
async function processConversion(type, url, onProgress) {
  // Notify progress started
  if (onProgress) onProgress(10);

  // Start conversion - server now handles the full flow
  const response = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type })
  });

  if (onProgress) onProgress(50);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert file');
  }

  const result = await response.json();
  
  if (onProgress) onProgress(100);

  if (!result.success) {
    throw new Error(result.error || 'Conversion failed');
  }

  return {
    success: true,
    downloadUrl: result.downloadUrl,
    filename: result.filename
  };
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
