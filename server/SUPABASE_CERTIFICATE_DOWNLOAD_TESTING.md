# Supabase Certificate Download Testing Guide

This guide will help you test the ability to download PDF certificates that were sent from the admin using Supabase storage.

## Prerequisites

1. ✅ Supabase project set up with storage buckets
2. ✅ Application running locally
3. ✅ Admin account with certificate upload permissions
4. ✅ User account to test certificate downloads
5. ✅ Sample PDF certificate files for testing

## Step 1: Verify Supabase Storage Setup

### Check Storage Buckets
1. Go to your Supabase dashboard → Storage
2. Verify you have a `certificates` bucket created
3. Ensure the bucket is set to **Public**
4. Check that RLS policies are configured correctly

### Required Storage Policies
Make sure these policies exist for the `certificates` bucket:

```sql
-- Allow authenticated users to upload certificates
CREATE POLICY "Allow authenticated users to upload certificates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'certificates' AND
  auth.role() = 'authenticated'
);

-- Allow users to view their own certificates
CREATE POLICY "Allow users to view their own certificates" ON storage.objects
FOR SELECT USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all certificates
CREATE POLICY "Allow admins to view all certificates" ON storage.objects
FOR SELECT USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
```

## Step 2: Test Certificate Upload (Admin Side)

### Login as Admin
1. Navigate to `/login`
2. Use admin credentials:
   - **Email**: `admin@yjchildcareplus.com`
   - **Password**: `admin123`

### Upload a Test Certificate
1. Go to **Admin Dashboard** → **Certificate Management**
2. Click **"Upload Certificate"** button
3. Select a student (e.g., Jane Doe or John Smith)
4. Select a class (e.g., "Child Development Associate (CDA)")
5. Upload a sample PDF certificate file
6. Click **"Upload Certificate"**

### Verify Upload Success
1. Check that the certificate appears in the certificate list
2. Verify the certificate shows:
   - ✅ Student name
   - ✅ Class name
   - ✅ Upload date
   - ✅ Status: "Active"

## Step 3: Test Certificate Download (User Side)

### Login as User
1. Navigate to `/login`
2. Use user credentials:
   - **Email**: `jane.doe@example.com`
   - **Password**: `password123`
   - **OR**
   - **Email**: `john.smith@example.com`
   - **Password**: `password123`

### Access User Profile
1. Click on your **profile** in the navigation
2. Scroll down to the **"Certificates"** section
3. You should see the certificate(s) uploaded by the admin

### Test Download Functionality
1. Click the **"Download"** button on any certificate
2. Verify the PDF opens in a new tab/window
3. Check that you can save the file locally
4. Verify the downloaded file is the same as what was uploaded

## Step 4: Test Different Scenarios

### Scenario 1: Multiple Certificates
1. Upload multiple certificates for the same user
2. Verify all certificates appear in the user's profile
3. Test downloading each certificate

### Scenario 2: Different File Types
1. Upload certificates in different formats:
   - PDF files
   - JPEG images
   - PNG images
2. Verify all file types can be downloaded correctly

### Scenario 3: Large Files
1. Upload a certificate file close to the 5MB limit
2. Verify upload and download work correctly

### Scenario 4: Certificate Access Control
1. Login as User A
2. Upload a certificate for User B
3. Login as User B
4. Verify User B can see and download their certificate
5. Login as User A
6. Verify User A cannot see User B's certificate

## Step 5: Troubleshooting Common Issues

### Issue: Certificate Not Appearing in User Profile
**Possible Causes:**
- Certificate not properly linked to user
- Database query not fetching certificates
- User profile component not rendering certificates

**Solutions:**
1. Check browser console for errors
2. Verify certificate record in database has correct `user_id`
3. Check that `getProfileWithDetails` function includes certificates

### Issue: Download Link Not Working
**Possible Causes:**
- Supabase storage URL is incorrect
- Storage bucket permissions not set correctly
- File was deleted from storage

**Solutions:**
1. Check the `certificate_url` in the database
2. Verify the URL is accessible in browser
3. Check Supabase storage bucket settings

### Issue: Upload Fails
**Possible Causes:**
- File size too large (>5MB)
- Invalid file type
- Supabase storage not configured
- Missing environment variables

**Solutions:**
1. Check file size and type
2. Verify Supabase environment variables
3. Check browser console for error messages

## Step 6: Verify Supabase Storage Integration

### Check File in Supabase Storage
1. Go to Supabase Dashboard → Storage → certificates bucket
2. Look for files in user-specific folders (e.g., `user_id/filename`)
3. Verify files are accessible via public URLs

### Test Direct URL Access
1. Copy the certificate URL from the database
2. Open in a new browser tab
3. Verify the file downloads correctly

## Step 7: Performance Testing

### Test Multiple Downloads
1. Download the same certificate multiple times
2. Verify download speed is consistent
3. Check for any timeout issues

### Test Concurrent Downloads
1. Open multiple browser tabs
2. Download different certificates simultaneously
3. Verify all downloads complete successfully

## Expected Results

✅ **Successful Test Outcomes:**
- Admin can upload certificates to Supabase storage
- Certificates appear in user profiles immediately
- Users can download certificates via direct links
- Download links work in new browser tabs
- Files maintain their original format and quality
- Access control works correctly (users only see their own certificates)

❌ **Failed Test Outcomes:**
- Upload fails with error messages
- Certificates don't appear in user profiles
- Download links return 404 or access denied errors
- Files are corrupted or incomplete
- Users can see other users' certificates

## Additional Notes

- **File Storage**: Certificates are stored in Supabase Storage with user-specific folder structure
- **URL Structure**: `https://[project].supabase.co/storage/v1/object/public/certificates/[user_id]/[filename]`
- **Security**: RLS policies ensure users can only access their own certificates
- **Performance**: Supabase Storage provides fast, reliable file access globally

## Support

If you encounter issues during testing:
1. Check the browser console for error messages
2. Verify Supabase project settings
3. Check database records for certificate metadata
4. Test with different browsers and devices 