export default async function handler(req, res) {
    const { path } = req.query;

    // Get the backend URL from environment variables
    // Try VITE_APP_URL first, then fallback to RAILWAY_BACKEND_URL
    const backendUrl = process.env.VITE_APP_URL || process.env.RAILWAY_BACKEND_URL;

    if (!backendUrl) {
        return res.status(500).json({
            error: 'Backend URL not configured. Please set VITE_APP_URL or RAILWAY_BACKEND_URL environment variable in Vercel dashboard.'
        });
    }

    // Construct the full backend URL
    const fullBackendUrl = backendUrl.startsWith('http')
        ? `${backendUrl}/api/${path.join('/')}`
        : `https://${backendUrl}/api/${path.join('/')}`;

    try {
        // Forward the request to the backend
        const response = await fetch(fullBackendUrl, {
            method: req.method,
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
                ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] })
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        // Get the response data
        const data = await response.text();

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Forward the response status and headers
        res.status(response.status);

        // Try to parse as JSON, fallback to text
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch {
            res.send(data);
        }

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Failed to proxy request to backend',
            details: error.message
        });
    }
}
