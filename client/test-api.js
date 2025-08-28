// Simple test script to verify API proxy functionality
// Run this with: node test-api.js

const testApiProxy = async () => {
    const baseUrl = 'http://localhost:3000'; // Change this to your Vercel URL when testing production

    console.log('Testing API proxy...');
    console.log('Base URL:', baseUrl);

    try {
        // Test GET request
        console.log('\n1. Testing GET request...');
        const getResponse = await fetch(`${baseUrl}/api/classes`);
        console.log('GET Status:', getResponse.status);
        console.log('GET Headers:', Object.fromEntries(getResponse.headers.entries()));

        const getData = await getResponse.text();
        console.log('GET Response:', getData.substring(0, 200) + '...');

        // Test POST request
        console.log('\n2. Testing POST request...');
        const postResponse = await fetch(`${baseUrl}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'test123'
            })
        });

        console.log('POST Status:', postResponse.status);
        console.log('POST Headers:', Object.fromEntries(postResponse.headers.entries()));

        const postData = await postResponse.text();
        console.log('POST Response:', postData.substring(0, 200) + '...');

    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

// Run the test
testApiProxy();
