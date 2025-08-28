export default async function handler(req, res) {
    const { path } = req.query;

    // Get the backend URL from environment variables
    // Priority: VITE_APP_URL > RAILWAY_BACKEND_URL > fallback to your actual backend URL
    const backendUrl = process.env.VITE_APP_URL ||
        process.env.RAILWAY_BACKEND_URL ||
        'https://your-backend-url.railway.app'; // Replace with your actual backend URL

    if (!backendUrl) {
        console.error('Backend URL not configured. Environment variables:', {
            VITE_APP_URL: process.env.VITE_APP_URL,
            RAILWAY_BACKEND_URL: process.env.RAILWAY_BACKEND_URL
        });

        return res.status(500).json({
            error: 'Backend URL not configured. Please set VITE_APP_URL or RAILWAY_BACKEND_URL environment variable in Vercel dashboard.',
            details: 'Check your Vercel environment variables and ensure the backend URL is correctly set.'
        });
    }

    // Construct the full backend URL
    const fullBackendUrl = backendUrl.startsWith('http')
        ? `${backendUrl}/api/${path.join('/')}`
        : `https://${backendUrl}/api/${path.join('/')}`;

    console.log(`Proxying ${req.method} request from /api/${path.join('/')} to ${fullBackendUrl}`);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

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
            // If the body is already a string, use it as is
            if (typeof req.body === 'string') {
                body = req.body;
            } else {
                // Otherwise, stringify it
                body = JSON.stringify(req.body);
            }
        }

        console.log('Sending request with body:', body);

        // Forward the request to the backend
        const response = await fetch(fullBackendUrl, {
            method: req.method,
            headers,
            body
        });

        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

        // Get the response data
        const data = await response.text();
        console.log('Backend response data:', data);

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

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
        console.error('Proxy error:', error);
        console.error('Request details:', {
            method: req.method,
            path: path.join('/'),
            backendUrl: fullBackendUrl,
            error: error.message
        });

        res.status(500).json({
            error: 'Failed to proxy request to backend',
            details: error.message,
            path: path.join('/'),
            backendUrl: fullBackendUrl
        });
    }
}
