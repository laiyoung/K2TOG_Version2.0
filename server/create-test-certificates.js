require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { supabase } = require('./config/supabase');
const fs = require('fs');
const path = require('path');

/**
 * Script to create test certificates with actual files in Supabase storage
 * This will:
 * 1. Create sample PDF content
 * 2. Upload files to Supabase storage
 * 3. Update database with real URLs
 */

const createSamplePDFContent = (studentName, className, certificateName) => {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
200 700 Td
(CERTIFICATE OF COMPLETION) Tj
ET
BT
/F1 16 Tf
150 650 Td
(This is to certify that) Tj
ET
BT
/F1 18 Tf
200 620 Td
(${studentName}) Tj
ET
BT
/F1 16 Tf
150 580 Td
(has successfully completed) Tj
ET
BT
/F1 18 Tf
200 550 Td
(${className}) Tj
ET
BT
/F1 16 Tf
150 510 Td
(Certificate: ${certificateName}) Tj
ET
BT
/F1 12 Tf
150 470 Td
(Issued on: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
400
%%EOF`;
};

const createTestCertificates = async () => {
    console.log('🎓 Creating Test Certificates with Supabase Storage...\n');

    try {
        // Step 1: Get users and classes from database
        console.log('📋 Step 1: Fetching users and classes...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .in('role', ['user', 'student']);

        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
            return;
        }

        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id, title');

        if (classesError) {
            console.error('❌ Error fetching classes:', classesError);
            return;
        }

        console.log(`✅ Found ${users.length} users and ${classes.length} classes`);

        // Step 2: Create test certificates for each user
        const testCertificates = [];
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const classIndex = i % classes.length;
            const classInfo = classes[classIndex];
            
            const certificateName = `${classInfo.title} Certificate`;
            const fileName = `certificate_${user.id}_${Date.now() + i}.pdf`;
            const filePath = `${user.id}/${fileName}`;
            
            // Create PDF content
            const pdfContent = createSamplePDFContent(
                `${user.first_name} ${user.last_name}`,
                classInfo.title,
                certificateName
            );

            console.log(`📄 Creating certificate for ${user.first_name} ${user.last_name}: ${certificateName}`);

            // Step 3: Upload to Supabase storage
            try {
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('certificates')
                    .upload(filePath, pdfContent, {
                        contentType: 'application/pdf',
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error(`❌ Upload failed for ${user.first_name}:`, uploadError);
                    continue;
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('certificates')
                    .getPublicUrl(filePath);

                console.log(`✅ Uploaded: ${fileName}`);
                console.log(`🔗 URL: ${urlData.publicUrl}`);

                // Add to test certificates array
                testCertificates.push({
                    user_id: user.id,
                    class_id: classInfo.id,
                    certificate_name: certificateName,
                    certificate_url: urlData.publicUrl,
                    verification_code: `${classInfo.title.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`,
                    status: 'approved',
                    uploaded_by: users.find(u => u.email === 'admin@yjchildcareplus.com')?.id || user.id,
                    created_at: new Date().toISOString()
                });

            } catch (uploadError) {
                console.error(`❌ Error uploading for ${user.first_name}:`, uploadError);
            }
        }

        // Step 4: Clear existing certificates and insert new ones
        console.log('\n🗄️  Step 4: Updating database...');
        
        // Delete existing certificates
        const { error: deleteError } = await supabase
            .from('certificates')
            .delete()
            .neq('id', 0); // Delete all certificates

        if (deleteError) {
            console.error('❌ Error deleting existing certificates:', deleteError);
            return;
        }

        console.log('✅ Cleared existing certificates');

        // Insert new certificates
        const { data: insertedCerts, error: insertError } = await supabase
            .from('certificates')
            .insert(testCertificates)
            .select();

        if (insertError) {
            console.error('❌ Error inserting certificates:', insertError);
            return;
        }

        console.log(`✅ Successfully created ${insertedCerts.length} test certificates`);

        // Step 5: Display results
        console.log('\n🎯 Test Certificates Created:');
        console.log('============================');
        insertedCerts.forEach((cert, index) => {
            const user = users.find(u => u.id === cert.user_id);
            const classInfo = classes.find(c => c.id === cert.class_id);
            console.log(`${index + 1}. ${cert.certificate_name}`);
            console.log(`   - User: ${user.first_name} ${user.last_name}`);
            console.log(`   - Class: ${classInfo.title}`);
            console.log(`   - URL: ${cert.certificate_url}`);
            console.log(`   - Status: ${cert.status}`);
            console.log('');
        });

        console.log('💡 Next Steps:');
        console.log('==============');
        console.log('1. Run the test script: npm run test:certificates');
        console.log('2. Login as a user to test certificate downloads');
        console.log('3. Navigate to user profile → Certificates section');
        console.log('4. Click "Download" on any certificate');

    } catch (error) {
        console.error('❌ Error creating test certificates:', error);
    }
};

// Run the script
createTestCertificates()
    .then(() => {
        console.log('\n✅ Test certificate creation completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    }); 