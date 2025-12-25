import { compressImage, resizeImage, convertImage, upscaleImage } from './lib/image-utils.js';
import { uploadToBlob, getContentType } from './lib/blob-utils.js';

/**
 * Combined Image endpoint - handles all image operations
 * POST /api/image?action=compress|resize|convert|upscale
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

  const action = req.query.action || req.body.action;

  try {
    switch (action) {
      case 'compress':
        return await handleCompress(req, res);
      case 'resize':
        return await handleResize(req, res);
      case 'convert':
        return await handleConvert(req, res);
      case 'upscale':
        return await handleUpscale(req, res);
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Invalid action: ${action}. Use: compress, resize, convert, upscale` 
        });
    }
  } catch (error) {
    console.error(`Image ${action} error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || `Failed to ${action} image`
    });
  }
}

async function handleCompress(req, res) {
  const { url, quality = 80, format = 'webp', maxWidth, maxHeight } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Image URL is required'
    });
  }

  const { buffer, originalSize, compressedSize, format: outputFormat } = await compressImage(url, {
    quality: parseInt(quality),
    format,
    maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
    maxHeight: maxHeight ? parseInt(maxHeight) : undefined
  });

  const filename = `compressed-${Date.now()}.${outputFormat}`;
  const result = await uploadToBlob(buffer, filename, getContentType(outputFormat));
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    originalSize,
    compressedSize,
    savings: `${savings}%`,
    format: outputFormat
  });
}

async function handleResize(req, res) {
  const { url, width: widthInput, height: heightInput, fit = 'cover' } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Image URL is required'
    });
  }

  // Convert string inputs to numbers
  const width = widthInput ? parseInt(String(widthInput), 10) : undefined;
  const height = heightInput ? parseInt(String(heightInput), 10) : undefined;

  if (!width && !height) {
    return res.status(400).json({
      success: false,
      error: 'Either width or height is required'
    });
  }

  // Validate numeric values
  if (width !== undefined && (isNaN(width) || width < 1 || width > 10000)) {
    return res.status(400).json({
      success: false,
      error: 'Width must be a number between 1 and 10000'
    });
  }

  if (height !== undefined && (isNaN(height) || height < 1 || height > 10000)) {
    return res.status(400).json({
      success: false,
      error: 'Height must be a number between 1 and 10000'
    });
  }

  const { buffer, width: outWidth, height: outHeight, format } = await resizeImage(url, {
    width,
    height,
    fit
  });

  const filename = `resized-${outWidth}x${outHeight}-${Date.now()}.${format}`;
  const result = await uploadToBlob(buffer, filename, getContentType(format));

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    width: outWidth,
    height: outHeight,
    format
  });
}

async function handleConvert(req, res) {
  const { url, format, quality = 90 } = req.body;
  const outputFormat = (format || 'webp').toLowerCase();

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Image URL is required'
    });
  }

  const validFormats = ['webp', 'jpeg', 'jpg', 'png', 'gif', 'tiff'];
  if (!validFormats.includes(outputFormat)) {
    return res.status(400).json({
      success: false,
      error: `Invalid format. Use: ${validFormats.join(', ')}`
    });
  }

  const { buffer, format: resultFormat } = await convertImage(url, {
    format: outputFormat,
    quality: parseInt(quality)
  });

  const filename = `converted-${Date.now()}.${resultFormat}`;
  const result = await uploadToBlob(buffer, filename, getContentType(resultFormat));

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    format: resultFormat
  });
}

async function handleUpscale(req, res) {
  const { url, scale = 2 } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Image URL is required'
    });
  }

  const validScales = [2, 4];
  const scaleInt = parseInt(scale);
  if (!validScales.includes(scaleInt)) {
    return res.status(400).json({
      success: false,
      error: 'Scale must be 2 or 4'
    });
  }

  const { buffer, width, height, format } = await upscaleImage(url, scaleInt);
  const filename = `upscaled-${scaleInt}x-${Date.now()}.${format}`;
  const result = await uploadToBlob(buffer, filename, getContentType(format));

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    width,
    height,
    scale: scaleInt,
    format
  });
}

