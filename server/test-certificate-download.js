require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { supabase } = require('./config/supabase');

/**
 * Test script to verify certificate download functionality
 * This script will:
 * 1. Check if certificates exist in the database
 * 2. Verify the Supabase storage URLs are accessible
 * 3. Test download functionality
 */

const testCertificateDownload = async () => {
    console.log('🔍 Testing Certificate Download Functionality...\n');

    try {
        // Step 1: Get all certificates from database
        console.log('📋 Step 1: Fetching certificates from database...');
        const { data: certificates, error: certError } = await supabase
            .from('certificates')
            .select(`
                *,
                users!certificates_user_id_fkey(first_name, last_name, email),
                classes!certificates_class_id_fkey(title)
            `);

        if (certError) {
            console.error('❌ Error fetching certificates:', certError);
            return;
        }

        if (!certificates || certificates.length === 0) {
            console.log('⚠️  No certificates found in database');
            console.log('💡 To test download functionality:');
            console.log('   1. Login as admin and upload a certificate');
            console.log('   2. Run this test script again');
            return;
        }

        console.log(`✅ Found ${certificates.length} certificate(s) in database\n`);

        // Step 2: Test each certificate
        for (let i = 0; i < certificates.length; i++) {
            const cert = certificates[i];
            console.log(`📄 Testing Certificate ${i + 1}:`);
            console.log(`   - Name: ${cert.certificate_name}`);
            console.log(`   - User: ${cert.users?.first_name} ${cert.users?.last_name}`);
            console.log(`   - Class: ${cert.classes?.title}`);
            console.log(`   - URL: ${cert.certificate_url}`);
            console.log(`   - Status: ${cert.status}`);

            // Step 3: Test URL accessibility
            if (cert.certificate_url) {
                console.log('   🔗 Testing URL accessibility...');
                
                try {
                    // Test if the URL is accessible
                    const response = await fetch(cert.certificate_url, { method: 'HEAD' });
                    
                    if (response.ok) {
                        console.log('   ✅ URL is accessible');
                        
                        // Get file info
                        const contentLength = response.headers.get('content-length');
                        const contentType = response.headers.get('content-type');
                        
                        if (contentLength) {
                            console.log(`   📏 File size: ${(contentLength / 1024).toFixed(2)} KB`);
                        }
                        if (contentType) {
                            console.log(`   📄 Content type: ${contentType}`);
                        }
                    } else {
                        console.log(`   ❌ URL not accessible (Status: ${response.status})`);
                    }
                } catch (urlError) {
                    console.log(`   ❌ Error testing URL: ${urlError.message}`);
                }
            } else {
                console.log('   ⚠️  No certificate URL found');
            }

            console.log(''); // Empty line for readability
        }

        // Step 4: Test Supabase storage bucket
        console.log('🗂️  Step 4: Testing Supabase storage bucket...');
        try {
            const { data: storageFiles, error: storageError } = await supabase.storage
                .from('certificates')
                .list('', { limit: 100 });

            if (storageError) {
                console.error('❌ Error accessing storage bucket:', storageError);
            } else {
                console.log(`✅ Storage bucket accessible`);
                console.log(`📁 Found ${storageFiles?.length || 0} file(s) in storage`);
                
                if (storageFiles && storageFiles.length > 0) {
                    console.log('📋 Storage files:');
                    storageFiles.forEach((file, index) => {
                        console.log(`   ${index + 1}. ${file.name} (${(file.metadata?.size / 1024).toFixed(2)} KB)`);
                    });
                }
            }
        } catch (storageTestError) {
            console.error('❌ Error testing storage:', storageTestError);
        }

        console.log('\n🎯 Test Summary:');
        console.log('================');
        console.log(`📊 Total certificates in database: ${certificates.length}`);
        
        const accessibleCerts = certificates.filter(cert => cert.certificate_url);
        console.log(`🔗 Certificates with URLs: ${accessibleCerts.length}`);
        
        const activeCerts = certificates.filter(cert => cert.status === 'approved');
        console.log(`✅ Active certificates: ${activeCerts.length}`);

        console.log('\n💡 Next Steps:');
        console.log('==============');
        console.log('1. Login as a user to test certificate download in the UI');
        console.log('2. Use the test credentials from the testing guide');
        console.log('3. Navigate to user profile → Certificates section');
        console.log('4. Click "Download" on any certificate');
        console.log('5. Verify the file downloads correctly');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Run the test
testCertificateDownload()
    .then(() => {
        console.log('\n✅ Certificate download test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }); 