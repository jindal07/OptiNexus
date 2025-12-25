import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Fetch PDF from URL and return as buffer
 */
export async function fetchPdfBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Merge multiple PDFs into one
 * @param {string[]} urls - Array of PDF URLs
 * @returns {Promise<Uint8Array>} Merged PDF bytes
 */
export async function mergePdfs(urls) {
  const mergedPdf = await PDFDocument.create();

  for (const url of urls) {
    const pdfBytes = await fetchPdfBuffer(url);
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

/**
 * Split PDF into individual pages or ranges
 * @param {string} url - PDF URL
 * @param {string} ranges - Page ranges like "1-3,5,7-10" or empty for all
 * @returns {Promise<{pages: Uint8Array[], pageNumbers: number[][]}>}
 */
export async function splitPdf(url, ranges = '') {
  const pdfBytes = await fetchPdfBuffer(url);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();

  // Parse page ranges
  const pagesToExtract = parsePageRanges(ranges, totalPages);
  const results = [];

  for (const pageIndices of pagesToExtract) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => newPdf.addPage(page));
    results.push({
      bytes: await newPdf.save(),
      pages: pageIndices.map(p => p + 1)
    });
  }

  return { results, totalPages };
}

/**
 * Parse page range string like "1-3,5,7-10"
 */
function parsePageRanges(rangeStr, totalPages) {
  if (!rangeStr || rangeStr.trim() === '') {
    // Return each page individually
    return Array.from({ length: totalPages }, (_, i) => [i]);
  }

  const ranges = [];
  const parts = rangeStr.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      const pageIndices = [];
      for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
        pageIndices.push(i - 1);
      }
      if (pageIndices.length > 0) ranges.push(pageIndices);
    } else {
      const pageNum = parseInt(part);
      if (pageNum >= 1 && pageNum <= totalPages) {
        ranges.push([pageNum - 1]);
      }
    }
  }

  return ranges.length > 0 ? ranges : Array.from({ length: totalPages }, (_, i) => [i]);
}

/**
 * Compress PDF
 * @param {string} url - PDF URL
 * @returns {Promise<{bytes: Uint8Array, originalSize: number, compressedSize: number}>}
 */
export async function compressPdf(url) {
  const pdfBytes = await fetchPdfBuffer(url);
  const originalSize = pdfBytes.length;

  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  // Save with compression options
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  return {
    bytes: compressedBytes,
    originalSize,
    compressedSize: compressedBytes.length
  };
}

/**
 * Rotate PDF pages
 * @param {string} url - PDF URL
 * @param {number} angle - Rotation angle (90, 180, 270)
 * @param {string} pageSelection - 'all' or comma-separated page numbers
 * @returns {Promise<Uint8Array>}
 */
export async function rotatePdf(url, angle = 90, pageSelection = 'all') {
  const pdfBytes = await fetchPdfBuffer(url);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();

  let pagesToRotate;
  if (pageSelection === 'all') {
    pagesToRotate = pages;
  } else {
    const pageNums = pageSelection.split(',').map(n => parseInt(n.trim()) - 1);
    pagesToRotate = pages.filter((_, i) => pageNums.includes(i));
  }

  pagesToRotate.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + angle));
  });

  return pdf.save();
}

/**
 * Add watermark to PDF
 * @param {string} url - PDF URL
 * @param {object} options - Watermark options
 * @returns {Promise<Uint8Array>}
 */
export async function watermarkPdf(url, options = {}) {
  const {
    text = 'CONFIDENTIAL',
    opacity = 0.3,
    fontSize = 50,
    color = '#888888'
  } = options;

  const pdfBytes = await fetchPdfBuffer(url);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  // Parse hex color
  const hexColor = color.replace('#', '');
  const r = parseInt(hexColor.substr(0, 2), 16) / 255;
  const g = parseInt(hexColor.substr(2, 2), 16) / 255;
  const b = parseInt(hexColor.substr(4, 2), 16) / 255;

  for (const page of pages) {
    const { width, height } = page.getSize();

    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(-45)
    });
  }

  return pdf.save();
}

/**
 * Get PDF info
 * @param {string} url - PDF URL
 * @returns {Promise<object>}
 */
export async function getPdfInfo(url) {
  const pdfBytes = await fetchPdfBuffer(url);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    subject: pdf.getSubject(),
    creator: pdf.getCreator(),
    producer: pdf.getProducer(),
    creationDate: pdf.getCreationDate()?.toISOString(),
    modificationDate: pdf.getModificationDate()?.toISOString(),
    fileSize: pdfBytes.length
  };
}

