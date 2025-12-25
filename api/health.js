/**
 * Health check endpoint
 * GET /api/health
 */
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'PDF-Flow API is running',
    version: '2.0.0',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
}

