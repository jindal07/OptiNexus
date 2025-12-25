import { mergePdfs, splitPdf, compressPdf, rotatePdf, addWatermark } from './lib/pdf-utils.js';
import { uploadToBlob, getContentType } from './lib/blob-utils.js';

/**
 * Combined PDF endpoint - handles all PDF operations
 * POST /api/pdf?action=merge|split|compress|rotate|watermark
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
      case 'merge':
        return await handleMerge(req, res);
      case 'split':
        return await handleSplit(req, res);
      case 'compress':
        return await handleCompress(req, res);
      case 'rotate':
        return await handleRotate(req, res);
      case 'watermark':
        return await handleWatermark(req, res);
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Invalid action: ${action}. Use: merge, split, compress, rotate, watermark` 
        });
    }
  } catch (error) {
    console.error(`PDF ${action} error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || `Failed to ${action} PDF`
    });
  }
}

async function handleMerge(req, res) {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'At least 2 PDF URLs are required'
    });
  }

  const mergedBytes = await mergePdfs(urls);
  const filename = `merged-${Date.now()}.pdf`;
  const result = await uploadToBlob(Buffer.from(mergedBytes), filename, getContentType('pdf'));

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    pageCount: urls.length
  });
}

async function handleSplit(req, res) {
  const { url, ranges } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'PDF URL is required'
    });
  }

  const results = await splitPdf(url, ranges);
  const uploadedFiles = [];

  for (let i = 0; i < results.length; i++) {
    const { bytes, pageRange } = results[i];
    const filename = `split-${pageRange}-${Date.now()}.pdf`;
    const uploaded = await uploadToBlob(Buffer.from(bytes), filename, getContentType('pdf'));
    uploadedFiles.push({
      downloadUrl: uploaded.url,
      filename,
      pageRange
    });
  }

  return res.status(200).json({
    success: true,
    files: uploadedFiles,
    count: uploadedFiles.length
  });
}

async function handleCompress(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'PDF URL is required'
    });
  }

  const { bytes, originalSize, compressedSize } = await compressPdf(url);
  const filename = `compressed-${Date.now()}.pdf`;
  const result = await uploadToBlob(Buffer.from(bytes), filename, getContentType('pdf'));
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    originalSize,
    compressedSize,
    savings: `${savings}%`
  });
}

async function handleRotate(req, res) {
  const { url, angle = 90, pages = 'all' } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'PDF URL is required'
    });
  }

  const rotatedBytes = await rotatePdf(url, parseInt(angle), pages);
  const filename = `rotated-${Date.now()}.pdf`;
  const result = await uploadToBlob(Buffer.from(rotatedBytes), filename, getContentType('pdf'));

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename,
    angle,
    pages
  });
}

async function handleWatermark(req, res) {
  const { 
    url, 
    text = 'WATERMARK', 
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

  const watermarkedBytes = await addWatermark(url, { text, opacity, fontSize, color });
  const filename = `watermarked-${Date.now()}.pdf`;
  const result = await uploadToBlob(Buffer.from(watermarkedBytes), filename, getContentType('pdf'));

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    filename
  });
}

