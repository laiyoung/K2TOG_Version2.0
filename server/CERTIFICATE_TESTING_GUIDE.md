# Certificate Testing Guide

## 🎯 **Problem Solved**

You were unable to see certificates in the user's profile even though they were visible in the admin certificate management. This was because:

1. **Missing Certificate Fetch**: The `getProfileWithDetails` function wasn't fetching certificates
2. **Missing Issue Date**: The frontend was looking for `issue_date` which doesn't exist in the database
3. **Database Constraints**: The enrollment status 'completed' wasn't allowed

## ✅ **Fixes Applied**

### 1. **Added Certificate Fetching to Profile**
- Updated `server/models/userModel.js` to fetch certificates in `getProfileWithDetails`
- Certificates are now included in the user profile data

### 2. **Fixed Frontend Component**
- Updated `client/src/components/profile/CertificatesSection.jsx` to use `created_at` instead of `issue_date`
- Certificates now display properly in the user profile

### 3. **Updated Seed Data**
- Fixed enrollment status to use 'approved' instead of 'completed'
- Added proper certificate data with realistic dates
- Removed non-existent database fields

## 🧪 **How to Test Certificate Display**

### **Step 1: Login as a Test User**
```bash
# Use these test accounts:
jane@example.com / user123    # Has 2 certificates
john@example.com / user123    # Has 1 certificate
```

### **Step 2: Navigate to User Profile**
1. Login to the application
2. Go to your profile page
3. Click on the "Certificates" section in the navigation

### **Step 3: Verify Certificate Display**
You should see:
- **Jane Doe**: 2 certificates
  - Child Development Associate (CDA) Certificate
  - Development and Operations Certificate
- **John Smith**: 1 certificate
  - CPR and First Aid Certification

### **Step 4: Test Certificate Download**
- Click the "Download" button on any certificate
- Verify the certificate URL opens correctly

## 🔧 **Technical Details**

### **Database Structure**
```sql
-- Certificates table
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  class_id INTEGER REFERENCES classes(id),
  certificate_name VARCHAR(255),
  certificate_url VARCHAR(255),
  verification_code VARCHAR(50),
  status VARCHAR(20),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE
);
```

### **Profile Data Structure**
```javascript
// User profile now includes certificates
{
  id: 'user-id',
  name: 'Jane Doe',
  email: 'jane@example.com',
  certificates: [
    {
      id: 1,
      certificate_name: 'Child Development Associate (CDA) Certificate',
      certificate_url: 'https://example.com/certs/cda.pdf',
      class_name: 'Child Development Associate (CDA)',
      status: 'approved',
      created_at: '2025-06-20T00:00:00.000Z'
    }
  ]
}
```

## 🚀 **Testing Commands**

### **Run Seed Script**
```bash
cd server
npm run seed:supabase
```

### **Test Certificate Fetching**
```bash
cd server
node test-certificates.js
```

### **Verify Database**
```sql
-- Check certificates for Jane
SELECT c.*, cls.title as class_name 
FROM certificates c 
LEFT JOIN classes cls ON c.class_id = cls.id 
WHERE c.user_id = (SELECT id FROM users WHERE email = 'jane@example.com');
```

## 📋 **Test Scenarios**

### **Scenario 1: User with Certificates**
- **User**: jane@example.com
- **Expected**: 2 certificates visible in profile
- **Test**: Navigate to profile → Certificates section

### **Scenario 2: User without Certificates**
- **User**: instructor1@example.com
- **Expected**: "No certificates yet" message
- **Test**: Navigate to profile → Certificates section

### **Scenario 3: Certificate Download**
- **User**: Any user with certificates
- **Expected**: Download button opens certificate URL
- **Test**: Click download button on any certificate

## 🎉 **Success Criteria**

✅ Certificates appear in user profile  
✅ Certificate names and class names display correctly  
✅ Issue dates show properly (using created_at)  
✅ Download buttons work  
✅ Empty state shows for users without certificates  
✅ Certificate count shows in profile overview  

## 🔍 **Troubleshooting**

### **If certificates don't appear:**
1. Check if the user has certificates in the database
2. Verify the profile API is returning certificate data
3. Check browser console for JavaScript errors
4. Ensure the user is logged in correctly

### **If download doesn't work:**
1. Check if certificate_url is valid
2. Verify the URL is accessible
3. Check browser console for errors

### **If dates don't display:**
1. Verify created_at field exists in certificate data
2. Check if the date format is correct
3. Ensure the frontend is using created_at instead of issue_date 