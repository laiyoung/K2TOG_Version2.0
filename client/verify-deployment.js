// Deployment verification script
// Run this after deploying to Vercel to verify everything is working

const testEndpoints = async () => {
    const baseUrl = process.argv[2] || 'https://client-six-kappa-83.vercel.app';

    console.log(`🔍 Testing deployment at: ${baseUrl}`);
    console.log('=====================================\n');

    // Test 1: Test proxy endpoint
    console.log('1️⃣ Testing API proxy endpoint...');
    try {
        const response = await fetch(`${baseUrl}/api/test-proxy`);
        const data = await response.json();
        console.log('✅ Test proxy working:', data.message);
        console.log('   Environment variables:', data.environment);
    } catch (error) {
        console.log('❌ Test proxy failed:', error.message);
    }

    console.log('\n2️⃣ Testing API proxy with backend...');
    try {
        const response = await fetch(`${baseUrl}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123',
                firstName: 'Test',
                lastName: 'User'
            })
        });

        if (response.status === 504) {
            console.log('⚠️  Got 504 Gateway Timeout - this might indicate:');
            console.log('   - Backend is slow to respond');
            console.log('   - Environment variables not set correctly');
            console.log('   - Network connectivity issues');
        } else if (response.status === 400) {
            console.log('✅ API proxy working (got expected 400 for invalid data)');
        } else {
            console.log(`ℹ️  Got status ${response.status} - proxy is working`);
        }
    } catch (error) {
        console.log('❌ API proxy test failed:', error.message);
    }

    console.log('\n3️⃣ Checking environment variables...');
    console.log('   Make sure these are set in Vercel dashboard:');
    console.log('   - VITE_APP_URL = your-railway-backend-url.railway.app');
    console.log('   - RAILWAY_BACKEND_URL = your-railway-backend-url.railway.app');

    console.log('\n4️⃣ Next steps:');
    console.log('   - Check Vercel function logs for timeout details');
    console.log('   - Verify Railway backend is responding quickly');
    console.log('   - Test with a real user registration');
};

// Run the tests
testEndpoints().catch(console.error);
