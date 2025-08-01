require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { supabase } = require('./config/supabase');

const cleanupStorage = async () => {
    console.log('🧹 Starting Supabase Storage cleanup...\n');

    try {
        // Step 1: List all files in certificates bucket
        console.log('📋 Step 1: Listing files in certificates bucket...');
        const { data: certificateFiles, error: certListError } = await supabase.storage
            .from('certificates')
            .list('', {
                limit: 100,
                offset: 0
            });

        if (certListError) {
            console.error('❌ Error listing certificate files:', certListError);
            return;
        }

        console.log(`Found ${certificateFiles.length} files in certificates bucket:`);
        certificateFiles.forEach(file => {
            console.log(`  - ${file.name}`);
        });

        // Step 2: List all files in user-uploads bucket
        console.log('\n📋 Step 2: Listing files in user-uploads bucket...');
        const { data: userFiles, error: userListError } = await supabase.storage
            .from('user-uploads')
            .list('', {
                limit: 100,
                offset: 0
            });

        if (userListError) {
            console.error('❌ Error listing user upload files:', userListError);
            return;
        }

        console.log(`Found ${userFiles.length} files in user-uploads bucket:`);
        userFiles.forEach(file => {
            console.log(`  - ${file.name}`);
        });

        // Step 3: Delete all certificate files
        if (certificateFiles.length > 0) {
            console.log('\n🗑️  Step 3: Deleting certificate files...');
            const filePaths = certificateFiles.map(file => file.name);
            
            const { error: certDeleteError } = await supabase.storage
                .from('certificates')
                .remove(filePaths);

            if (certDeleteError) {
                console.error('❌ Error deleting certificate files:', certDeleteError);
            } else {
                console.log(`✅ Deleted ${certificateFiles.length} certificate files`);
            }
        }

        // Step 4: Delete all user upload files
        if (userFiles.length > 0) {
            console.log('\n🗑️  Step 4: Deleting user upload files...');
            const filePaths = userFiles.map(file => file.name);
            
            const { error: userDeleteError } = await supabase.storage
                .from('user-uploads')
                .remove(filePaths);

            if (userDeleteError) {
                console.error('❌ Error deleting user upload files:', userDeleteError);
            } else {
                console.log(`✅ Deleted ${userFiles.length} user upload files`);
            }
        }

        // Step 5: Clear database records
        console.log('\n🗄️  Step 5: Clearing database records...');
        
        // Delete certificates
        const { error: certDbError } = await supabase
            .from('certificates')
            .delete()
            .neq('id', 0);

        if (certDbError) {
            console.error('❌ Error deleting certificate records:', certDbError);
        } else {
            console.log('✅ Cleared certificate records');
        }

        // Delete user files
        const { error: userFileDbError } = await supabase
            .from('user_files')
            .delete()
            .neq('id', 0);

        if (userFileDbError) {
            console.error('❌ Error deleting user file records:', userFileDbError);
        } else {
            console.log('✅ Cleared user file records');
        }

        console.log('\n🎉 Storage cleanup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Run: npm run seed:supabase (to recreate database records)');
        console.log('2. Run: npm run create:test-certificates (to create new test files)');

    } catch (error) {
        console.error('❌ Unexpected error during cleanup:', error);
    }
};

// Run the cleanup
cleanupStorage(); 