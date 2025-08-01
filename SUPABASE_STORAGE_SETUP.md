# Supabase Storage Setup Guide

This guide will help you set up Supabase storage for certificate uploads in your YJ Child Care Plus application.

## Prerequisites

1. A Supabase account and project
2. Node.js and npm installed
3. Your application running locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note down your project URL and API keys

## Step 2: Set Up Storage Buckets

### Create Storage Buckets

In your Supabase dashboard, go to **Storage** and create two buckets:

1. **certificates** bucket:
   - Name: `certificates`
   - Public bucket: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `application/pdf, image/jpeg, image/png`

2. **user-uploads** bucket:
   - Name: `user-uploads`
   - Public bucket: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `application/pdf, image/jpeg, image/png`

### Configure Storage Policies

For each bucket, set up the following Row Level Security (RLS) policies:

#### Certificates Bucket Policies

1. **Allow authenticated users to upload certificates:**
   ```sql
   CREATE POLICY "Allow authenticated users to upload certificates" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'certificates' AND
     auth.role() = 'authenticated'
   );
   ```

2. **Allow users to view their own certificates:**
   ```sql
   CREATE POLICY "Allow users to view their own certificates" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'certificates' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Allow admins to view all certificates:**
   ```sql
   CREATE POLICY "Allow admins to view all certificates" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'certificates' AND
     EXISTS (
       SELECT 1 FROM users 
       WHERE users.id = auth.uid() AND users.role = 'admin'
     )
   );
   ```

4. **Allow users to delete their own certificates:**
   ```sql
   CREATE POLICY "Allow users to delete their own certificates" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'certificates' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

#### User Uploads Bucket Policies

1. **Allow authenticated users to upload files:**
   ```sql
   CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'user-uploads' AND
     auth.role() = 'authenticated'
   );
   ```

2. **Allow users to view their own files:**
   ```sql
   CREATE POLICY "Allow users to view their own files" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'user-uploads' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Allow users to delete their own files:**
   ```sql
   CREATE POLICY "Allow users to delete their own files" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'user-uploads' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

## Step 3: Environment Variables

### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_URL=http://localhost:5000/api
```

### Server Environment Variables

Add these to your existing `.env` file in the `server` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Database Migration

Update your certificates table to include Supabase path:

```sql
-- Add Supabase path column to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS supabase_path VARCHAR(255);

-- Create index for Supabase path
CREATE INDEX IF NOT EXISTS idx_certificates_supabase_path ON certificates(supabase_path);
```

## Step 5: Testing the Setup

### Test Certificate Upload (Admin)

1. Log in as an admin
2. Go to the certificate management page
3. Try uploading a certificate for a student
4. Verify the file appears in your Supabase storage bucket

### Test User File Upload

1. Log in as a regular user
2. Go to your profile page
3. Try uploading a file using the FileUpload component
4. Verify the file appears in the user-uploads bucket

## Step 6: Migration from Cloudinary (Optional)

If you want to migrate existing certificates from Cloudinary to Supabase:

1. Export your existing certificate data
2. Download files from Cloudinary
3. Upload them to Supabase storage
4. Update the database records with new Supabase paths

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Supabase project allows requests from your domain
2. **Authentication Errors**: Verify your API keys are correct
3. **File Upload Failures**: Check file size limits and allowed MIME types
4. **Permission Denied**: Verify RLS policies are correctly configured

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test Supabase connection in the browser console:
   ```javascript
   import { supabase } from './config/supabase'
   console.log(supabase)
   ```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **File Validation**: Always validate file types and sizes on both client and server
3. **Access Control**: Use RLS policies to restrict file access
4. **Rate Limiting**: Consider implementing rate limiting for uploads

## Performance Optimization

1. **Image Optimization**: Consider using Supabase's image transformation features
2. **CDN**: Supabase storage automatically uses CDN for better performance
3. **Caching**: Implement appropriate caching strategies for frequently accessed files

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase storage guide](https://supabase.com/docs/guides/storage)
3. Check the [Supabase community forum](https://github.com/supabase/supabase/discussions) 