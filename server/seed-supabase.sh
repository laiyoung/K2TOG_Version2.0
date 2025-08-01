#!/bin/bash

# Seed Supabase Database Script
# This script runs the Supabase seed script with proper environment setup

echo "🚀 Starting Supabase Database Seeding..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please make sure you have a .env file with your Supabase credentials:"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Load environment variables
source .env

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file"
    exit 1
fi

echo "✅ Environment variables loaded successfully"
echo "📊 Running Supabase seed script..."

# Run the seed script
npm run seed:supabase

if [ $? -eq 0 ]; then
    echo "✅ Supabase database seeded successfully!"
    echo ""
    echo "🎉 Test Accounts Created:"
    echo "Regular Users:"
    echo "  jane@example.com / user123"
    echo "  john@example.com / user123"
    echo ""
    echo "Admins:"
    echo "  admin@example.com / admin123"
    echo "  admin@yjchildcare.com / admin123"
    echo ""
    echo "Instructors:"
    echo "  instructor1@example.com / user123"
    echo "  instructor2@example.com / user123"
    echo ""
    echo "You can now log in with these accounts!"
else
    echo "❌ Error: Failed to seed Supabase database"
    exit 1
fi 