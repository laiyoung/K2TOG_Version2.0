import React, { useState } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import CertificateUpload from '../components/CertificateUpload';
import { uploadCertificate } from '../services/certificateService';

const CertificateUploadPage = () => {
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleUpload = async (file) => {
        try {
            // For demo purposes, using a hardcoded student ID and class ID
            // In a real implementation, these would come from props or form data
            const studentId = "123"; // This should be dynamic
            const classId = "1"; // This should be dynamic

            const result = await uploadCertificate(studentId, file, classId);

            setUploadStatus({
                type: 'success',
                message: 'Certificate uploaded successfully!'
            });

            console.log('Upload result:', result);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus({
                type: 'error',
                message: error.message || 'Failed to upload certificate'
            });
            throw error; // Re-throw so the component can handle it
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Upload Student Certificate
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                    Upload a certificate for a student. Supported formats include PDF and image files (JPEG, PNG).
                    Maximum file size is 5MB.
                </Typography>

                {uploadStatus && (
                    <Alert
                        severity={uploadStatus.type}
                        sx={{ mb: 2 }}
                        onClose={() => setUploadStatus(null)}
                    >
                        {uploadStatus.message}
                    </Alert>
                )}

                <CertificateUpload
                    onUpload={handleUpload}
                    studentId="123" // This will be dynamic in the actual implementation
                />
            </Box>
        </Container>
    );
};

export default CertificateUploadPage; 