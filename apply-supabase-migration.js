#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Supabase Migration Application Script');
console.log('==========================================\n');

// Check if Supabase CLI is available
try {
    execSync('npx supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI is available');
} catch (error) {
    console.error('❌ Supabase CLI not found. Please install it first:');
    console.error('   npm install --save-dev supabase');
    process.exit(1);
}

// Check if migration file exists
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240802000000_add_session_and_expiration_to_certificates.sql');
if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
}

console.log('✅ Migration file found');

// Function to run command and handle errors
function runCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('\n📋 Available options:');
    console.log('1. Apply migration to local Supabase instance');
    console.log('2. Apply migration to remote Supabase project');
    console.log('3. Start local Supabase instance');
    console.log('4. Check Supabase status');
    console.log('5. Exit');

    // For now, let's provide instructions
    console.log('\n📝 Instructions:');
    console.log('1. If you want to apply to LOCAL Supabase:');
    console.log('   npm run supabase:start');
    console.log('   npm run supabase:migration:reset');
    console.log('');
    console.log('2. If you want to apply to REMOTE Supabase:');
    console.log('   npx supabase link --project-ref YOUR_PROJECT_REF');
    console.log('   npm run supabase:migration:up');
    console.log('');
    console.log('3. To check status:');
    console.log('   npm run supabase:status');
    console.log('');
    console.log('📖 For detailed instructions, see: SUPABASE_MIGRATION_SETUP.md');
}

main().catch(console.error); 