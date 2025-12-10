// Simple debug endpoint for Vercel deployment
module.exports = (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      // Database config (without sensitive data)
      DB_HOST: process.env.DB_HOST ? '***SET***' : 'NOT_SET',
      DB_NAME: process.env.DB_NAME ? '***SET***' : 'NOT_SET',
      DB_USER: process.env.DB_USER ? '***SET***' : 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT_SET',
      // Vercel Postgres
      POSTGRES_HOST: process.env.POSTGRES_HOST ? '***SET***' : 'NOT_SET',
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? '***SET***' : 'NOT_SET',
      POSTGRES_USER: process.env.POSTGRES_USER ? '***SET***' : 'NOT_SET',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? '***SET***' : 'NOT_SET',
      // Other required vars
      JWT_SECRET: process.env.JWT_SECRET ? '***SET***' : 'NOT_SET',
      SCHOOL_NAME: process.env.SCHOOL_NAME || 'NOT_SET',
      FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? '***SET***' : 'NOT_SET',
    },
    vercel: {
      region: process.env.VERCEL_REGION,
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID,
      url: process.env.VERCEL_URL,
    }
  };

  res.json(diagnostics);
};