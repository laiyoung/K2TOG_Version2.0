// Test endpoint to verify API proxy is working
export default async function handler(req, res) {
    console.log(`[${new Date().toISOString()}] Test proxy endpoint called`);

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Return a simple test response
    res.status(200).json({
        message: 'API proxy test endpoint is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        environment: {
            VITE_APP_URL: process.env.VITE_APP_URL,
            RAILWAY_BACKEND_URL: process.env.RAILWAY_BACKEND_URL,
            NODE_ENV: process.env.NODE_ENV
        }
    });
}
