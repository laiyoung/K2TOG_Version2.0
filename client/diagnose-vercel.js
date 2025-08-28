// Diagnostic script to help identify Vercel deployment issues
// Run this in your browser console on your Vercel deployment

const diagnoseVercel = async () => {
    const baseUrl = window.location.origin;
    console.log('🔍 Diagnosing Vercel deployment...');
    console.log('Base URL:', baseUrl);

    const tests = [
        {
            name: 'Test API Proxy Function',
            url: `${baseUrl}/api-proxy/test`,
            expected: 'JSON response from test function'
        },
        {
            name: 'Test API Rewrite',
            url: `${baseUrl}/api/classes`,
            expected: 'Either JSON from backend or environment variable error'
        },
        {
            name: 'Test Catch-all Route',
            url: `${baseUrl}/nonexistent`,
            expected: 'HTML (index.html)'
        }
    ];

    for (const test of tests) {
        console.log(`\n🧪 Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);
        console.log(`Expected: ${test.expected}`);

        try {
            const response = await fetch(test.url);
            const contentType = response.headers.get('content-type');
            const data = await response.text();

            console.log(`Status: ${response.status}`);
            console.log(`Content-Type: ${contentType}`);
            console.log(`Response Preview: ${data.substring(0, 200)}...`);

            // Analyze the response
            if (contentType && contentType.includes('application/json')) {
                console.log('✅ Response is JSON - Function is working!');
            } else if (data.includes('<!DOCTYPE html>')) {
                console.log('⚠️ Response is HTML - Function not being called');
            } else {
                console.log('❓ Unexpected response type');
            }

        } catch (error) {
            console.error(`❌ Test failed:`, error.message);
        }
    }

    // Additional diagnostics
    console.log('\n📊 Environment Information:');
    console.log('User Agent:', navigator.userAgent);
    console.log('Current Path:', window.location.pathname);
    console.log('Current URL:', window.location.href);

    // Check if we're in production
    if (baseUrl.includes('vercel.app')) {
        console.log('🌐 Running on Vercel production');
    } else if (baseUrl.includes('localhost')) {
        console.log('🏠 Running locally');
    } else {
        console.log('🌍 Running on unknown domain');
    }
};

// Run the diagnosis
diagnoseVercel();

// Export for manual testing
window.diagnoseVercel = diagnoseVercel;
