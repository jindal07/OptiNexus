/**
 * Upload file directly to Vercel Blob from the client
 * This bypasses the 4.5MB serverless function limit
 */
export async function uploadToBlob(file) {
  // For Vercel Blob client uploads, we need to get an upload URL from our API
  // or use the direct upload approach
  
  // Option 1: Direct upload using fetch (for development/simple cases)
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Upload multiple files to Vercel Blob
 * @param {File[]} files - Array of files to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string[]>} Array of uploaded URLs
 */
export async function uploadMultipleToBlob(files, onProgress) {
  const urls = [];
  
  for (let i = 0; i < files.length; i++) {
    const url = await uploadToBlob(files[i]);
    urls.push(url);
    
    if (onProgress) {
      onProgress((i + 1) / files.length * 100);
    }
  }
  
  return urls;
}

/**
 * Generate a unique filename
 */
export function generateFilename(originalName) {
  const ext = originalName.split('.').pop();
  const base = originalName.replace(/\.[^.]+$/, '');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${random}.${ext}`;
}

