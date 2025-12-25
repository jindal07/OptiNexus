/**
 * Password verification endpoint for CloudConvert features
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    // Get password from environment variable
    const correctPassword = process.env.CLOUDCONVERT_PASSWORD;

    if (!correctPassword) {
      console.error('CLOUDCONVERT_PASSWORD environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Password verification is not configured. Please set CLOUDCONVERT_PASSWORD environment variable.' 
      });
    }

    // Compare passwords (in production, use bcrypt or similar)
    if (password === correctPassword) {
      return res.status(200).json({ 
        success: true,
        message: 'Password verified'
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Incorrect password' 
      });
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

