// API proxy function for Vercel serverless deployment
export default async function handler(req, res) {
    // Enable CORS for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { path } = req.query;

    // Get the backend URL from environment variables
    const backendUrl = process.env.VITE_APP_URL ||
        process.env.RAILWAY_BACKEND_URL;

    if (!backendUrl) {
        console.error('Backend URL not configured. Environment variables:', {
            VITE_APP_URL: process.env.VITE_APP_URL,
            RAILWAY_BACKEND_URL: process.env.RAILWAY_BACKEND_URL
        });

        return res.status(500).json({
            error: 'Backend URL not configured',
            details: 'Please set VITE_APP_URL or RAILWAY_BACKEND_URL in Vercel environment variables',
            timestamp: new Date().toISOString()
        });
    }

    // Construct the full backend URL
    const fullBackendUrl = backendUrl.startsWith('http')
        ? `${backendUrl}/api/${path.join('/')}`
        : `https://${backendUrl}/api/${path.join('/')}`;

    console.log(`[${new Date().toISOString()}] Proxying ${req.method} /api/${path.join('/')} to ${fullBackendUrl}`);

    try {
        // Prepare headers for the backend request
        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json',
            ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
            ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] })
        };

        // Remove undefined headers
        Object.keys(headers).forEach(key => {
            if (headers[key] === undefined) {
                delete headers[key];
            }
        });

        // Prepare the request body
        let body;
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Forward the request to the backend
        const response = await fetch(fullBackendUrl, {
            method: req.method,
            headers,
            body
        });

        console.log(`[${new Date().toISOString()}] Backend response status:`, response.status);

        // Get the response data
        const data = await response.text();

        // Forward the response status
        res.status(response.status);

        // Try to parse as JSON, fallback to text
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            // If it's not JSON, send as text
            res.setHeader('Content-Type', 'text/plain');
            res.send(data);
        }

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Proxy error:`, error);

        res.status(500).json({
            error: 'Failed to proxy request to backend',
            details: error.message,
            path: path.join('/'),
            backendUrl: fullBackendUrl,
            timestamp: new Date().toISOString()
        });
    }
}
