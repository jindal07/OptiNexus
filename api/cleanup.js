import { cleanupExpiredFiles, getFileTTLFormatted } from './lib/blob-utils.js';

/**
 * Cleanup endpoint - called by Vercel Cron to delete expired files
 * 
 * This endpoint is protected and should only be called by Vercel Cron
 * or with the correct authorization header.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is from Vercel Cron or authorized
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  // In production, verify the cron secret if configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also check for Vercel's internal cron header
    const vercelCronHeader = req.headers['x-vercel-cron'];
    if (!vercelCronHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    console.log('[Cleanup] Starting cleanup job...');
    const startTime = Date.now();
    
    const { deleted, errors } = await cleanupExpiredFiles();
    
    const duration = Date.now() - startTime;
    const ttl = getFileTTLFormatted();
    
    console.log(`[Cleanup] Completed in ${duration}ms. Deleted: ${deleted}, Errors: ${errors}`);
    
    return res.status(200).json({
      success: true,
      message: `Cleanup completed`,
      stats: {
        deleted,
        errors,
        duration: `${duration}ms`,
        ttl
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cleanup] Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

