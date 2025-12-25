import sharp from 'sharp';

/**
 * Fetch image from URL and return as buffer
 */
export async function fetchImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Compress image with quality and format options
 * @param {string} url - Image URL
 * @param {object} options - Compression options
 * @returns {Promise<{buffer: Buffer, originalSize: number, compressedSize: number, format: string}>}
 */
export async function compressImage(url, options = {}) {
  const { quality = 80, format = 'webp', maxWidth, maxHeight } = options;

  const imageBuffer = await fetchImageBuffer(url);
  const originalSize = imageBuffer.length;

  let sharpInstance = sharp(imageBuffer);

  // Resize if max dimensions specified
  if (maxWidth || maxHeight) {
    sharpInstance = sharpInstance.resize({
      width: maxWidth || undefined,
      height: maxHeight || undefined,
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Apply format and compression
  let outputBuffer;
  let outputFormat;

  switch (format) {
    case 'webp':
      outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
      outputFormat = 'webp';
      break;
    case 'jpeg':
    case 'jpg':
      outputBuffer = await sharpInstance.jpeg({ quality, mozjpeg: true }).toBuffer();
      outputFormat = 'jpeg';
      break;
    case 'png':
      outputBuffer = await sharpInstance.png({ quality, compressionLevel: 9 }).toBuffer();
      outputFormat = 'png';
      break;
    default:
      outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
      outputFormat = 'webp';
  }

  return {
    buffer: outputBuffer,
    originalSize,
    compressedSize: outputBuffer.length,
    format: outputFormat
  };
}

/**
 * Resize image to specific dimensions
 * @param {string} url - Image URL
 * @param {object} options - Resize options
 * @returns {Promise<{buffer: Buffer, width: number, height: number}>}
 */
export async function resizeImage(url, options = {}) {
  const { width, height, fit = 'cover' } = options;

  const imageBuffer = await fetchImageBuffer(url);

  const outputBuffer = await sharp(imageBuffer)
    .resize({
      width: width || undefined,
      height: height || undefined,
      fit,
      withoutEnlargement: false
    })
    .toBuffer();

  const metadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: metadata.width,
    height: metadata.height
  };
}

/**
 * Convert image to different format
 * @param {string} url - Image URL
 * @param {object} options - Conversion options
 * @returns {Promise<{buffer: Buffer, format: string}>}
 */
export async function convertImage(url, options = {}) {
  const { format = 'webp', quality = 90 } = options;

  const imageBuffer = await fetchImageBuffer(url);
  let sharpInstance = sharp(imageBuffer);
  let outputBuffer;

  switch (format) {
    case 'webp':
      outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
      break;
    case 'jpeg':
    case 'jpg':
      outputBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
      break;
    case 'png':
      outputBuffer = await sharpInstance.png({ quality }).toBuffer();
      break;
    case 'gif':
      outputBuffer = await sharpInstance.gif().toBuffer();
      break;
    case 'tiff':
      outputBuffer = await sharpInstance.tiff({ quality }).toBuffer();
      break;
    default:
      outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
  }

  return {
    buffer: outputBuffer,
    format
  };
}

/**
 * Upscale image using Lanczos algorithm (placeholder for AI upscaling)
 * For true AI upscaling, integrate with DeepAI or Replicate API
 * @param {string} url - Image URL
 * @param {number} scale - Scale factor (2 or 4)
 * @returns {Promise<{buffer: Buffer, originalDimensions: string, newDimensions: string}>}
 */
export async function upscaleImage(url, scale = 2) {
  const imageBuffer = await fetchImageBuffer(url);
  const metadata = await sharp(imageBuffer).metadata();

  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  const newWidth = Math.round(originalWidth * scale);
  const newHeight = Math.round(originalHeight * scale);

  // Use Lanczos for high-quality upscaling
  const outputBuffer = await sharp(imageBuffer)
    .resize(newWidth, newHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .sharpen({ sigma: 0.5 })
    .png({ quality: 100 })
    .toBuffer();

  return {
    buffer: outputBuffer,
    originalDimensions: `${originalWidth}x${originalHeight}`,
    newDimensions: `${newWidth}x${newHeight}`,
    scale
  };
}

/**
 * Get image metadata
 * @param {string} url - Image URL
 * @returns {Promise<object>}
 */
export async function getImageInfo(url) {
  const imageBuffer = await fetchImageBuffer(url);
  const metadata = await sharp(imageBuffer).metadata();

  return {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    channels: metadata.channels,
    hasAlpha: metadata.hasAlpha,
    size: imageBuffer.length
  };
}

