import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import FileUpload from '../FileUpload';
import supabaseStorageService from '../../services/supabaseStorageService';

const FileUploadSection = ({ userId, title = 'My Files', folder = 'general' }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load user files on component mount
    React.useEffect(() => {
        loadUserFiles();
    }, [userId, folder]);

    const loadUserFiles = async () => {
        try {
            setLoading(true);
            const fileList = await supabaseStorageService.listUserFiles(userId, 'user-uploads');
            setFiles(fileList || []);
        } catch (error) {
            console.error('Error loading files:', error);
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (uploadResult) => {
        try {
            // Add the new file to the list
            setFiles(prev => [...prev, {
                name: uploadResult.fileName,
                size: uploadResult.fileSize,
                type: uploadResult.fileType,
                path: uploadResult.filePath,
                url: uploadResult.publicUrl
            }]);

            // Show success message or trigger callback
            console.log('File uploaded successfully:', uploadResult);
        } catch (error) {
            console.error('Error handling file upload:', error);
            setError('Failed to process uploaded file');
        }
    };

    const handleFileDelete = async (filePath) => {
        try {
            await supabaseStorageService.deleteFile(filePath, 'user-uploads');
            setFiles(prev => prev.filter(file => file.path !== filePath));
        } catch (error) {
            console.error('Error deleting file:', error);
            setError('Failed to delete file');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType === 'application/pdf') {
            return <PdfIcon color="error" />;
        }
        if (fileType.startsWith('image/')) {
            return <ImageIcon color="primary" />;
        }
        return <ImageIcon />;
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* File Upload Component */}
            <FileUpload
                onUpload={handleFileUpload}
                userId={userId}
                folder={folder}
                title="Upload New File"
                description={`Upload a file to your ${folder} folder`}
            />

            {/* File List */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Your Files ({files.length})
                </Typography>

                {loading ? (
                    <Typography variant="body2" color="text.secondary">
                        Loading files...
                    </Typography>
                ) : files.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No files uploaded yet.
                    </Typography>
                ) : (
                    <List>
                        {files.map((file, index) => (
                            <ListItem key={index} divider>
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                    {getFileIcon(file.type)}
                                </Box>
                                <ListItemText
                                    primary={file.name}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatFileSize(file.size)} • {file.type}
                                            </Typography>
                                            <Chip
                                                label={folder}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleFileDelete(file.path)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Paper>
    );
};

export default FileUploadSection; 