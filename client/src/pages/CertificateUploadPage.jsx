import React, { useState } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import CertificateUpload from '../components/CertificateUpload';

const CertificateUploadPage = () => {
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleUpload = (file) => {
        // This is where you'll implement the actual upload logic later
        console.log('File to upload:', file);

        // Example of how the upload status might be handled
        setUploadStatus({
            type: 'info',
            message: 'Upload functionality will be implemented here'
        });

        // Simulate a delay
        setTimeout(() => {
            setUploadStatus({
                type: 'success',
                message: 'This is a demo. The actual upload will be implemented later.'
            });
        }, 1500);
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