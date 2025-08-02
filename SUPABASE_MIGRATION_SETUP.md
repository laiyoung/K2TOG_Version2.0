# Supabase Migration Setup Guide

This guide explains how to set up and use Supabase migrations for the YJ Child Care Plus project.

## Prerequisites

1. **Supabase CLI** - Already installed as a dev dependency
2. **Supabase Project** - You need a Supabase project URL and API keys

## Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Available Scripts

The following npm scripts are available for Supabase operations:

```bash
# Start local Supabase instance
npm run supabase:start

# Stop local Supabase instance
npm run supabase:stop

# Check Supabase status
npm run supabase:status

# Create a new migration
npm run supabase:migration:new migration_name

# Apply migrations to remote database
npm run supabase:migration:up

# Reset local database (applies all migrations)
npm run supabase:migration:reset
```

## Migration Workflow

### 1. Local Development

For local development, you can use the local Supabase instance:

```bash
# Start local Supabase
npm run supabase:start

# This will start:
# - Database on port 54322
# - API on port 54321
# - Studio on port 54323
# - Inbucket (email testing) on port 54324
```

### 2. Creating Migrations

To create a new migration:

```bash
npm run supabase:migration:new add_new_feature
```

This will create a new migration file in `supabase/migrations/` with a timestamp.

### 3. Applying Migrations

#### To Local Database:
```bash
npm run supabase:migration:reset
```

#### To Remote Database:
```bash
npm run supabase:migration:up
```

### 4. Linking to Remote Project

If you want to link to your remote Supabase project:

```bash
npx supabase link --project-ref your_project_ref
```

Replace `your_project_ref` with your actual Supabase project reference ID.

## Current Migration

The current migration `20240802000000_add_session_and_expiration_to_certificates.sql` adds:

- `session_id` - References the specific class session
- `expiration_date` - Date when the certificate expires
- Appropriate indexes for performance
- Comments for documentation

## Database Schema

The migration assumes the following tables exist:
- `certificates` - Main certificates table
- `class_sessions` - Class sessions table
- `users` - Users table
- `classes` - Classes table

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports are already in use, stop other services or change ports in `supabase/config.toml`

2. **Permission errors**: Make sure you have the correct Supabase API keys

3. **Migration conflicts**: If migrations conflict, you may need to reset the database:
   ```bash
   npm run supabase:migration:reset
   ```

### Getting Help

- Check Supabase status: `npm run supabase:status`
- View logs: `npx supabase logs`
- Access Supabase Studio: http://localhost:54323 (when running locally)

## Next Steps

1. Set up your Supabase project and get your API keys
2. Update your `.env` file with the correct values
3. Link to your remote project if needed
4. Apply the migration to your remote database
5. Test the new certificate upload functionality with session selection and expiration dates 