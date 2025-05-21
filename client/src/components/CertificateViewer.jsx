import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    MoreVert as MoreIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    CheckCircle as ActiveIcon,
    Cancel as RevokedIcon,
    Timer as ExpiredIcon
} from '@mui/icons-material';

const CertificateViewer = ({ certificates = [], onView, onDownload, onDelete, onStatusChange }) => {
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedCertForMenu, setSelectedCertForMenu] = useState(null);

    const handleMenuOpen = (event, certificate) => {
        setMenuAnchor(event.currentTarget);
        setSelectedCertForMenu(certificate);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedCertForMenu(null);
    };

    const handlePreviewOpen = (certificate) => {
        setSelectedCertificate(certificate);
        setPreviewOpen(true);
        handleMenuClose();
    };

    const handlePreviewClose = () => {
        setPreviewOpen(false);
        setSelectedCertificate(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <ActiveIcon color="success" />;
            case 'expired':
                return <ExpiredIcon color="warning" />;
            case 'revoked':
                return <RevokedIcon color="error" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'expired':
                return 'warning';
            case 'revoked':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Grid container spacing={3}>
                {certificates.map((certificate) => (
                    <Grid key={certificate.id} sx={{ width: { xs: '100%', lg: '33.33%' } }}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative'
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 2
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {certificate.file_type === 'application/pdf' ? (
                                            <PdfIcon color="error" />
                                        ) : (
                                            <ImageIcon color="primary" />
                                        )}
                                        <Typography variant="subtitle1" noWrap>
                                            {certificate.certificate_name}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, certificate)}
                                    >
                                        <MoreIcon />
                                    </IconButton>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Student: {certificate.student_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Class: {certificate.class_name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Uploaded: {formatDate(certificate.upload_date)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Size: {formatFileSize(certificate.file_size)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={getStatusIcon(certificate.status)}
                                        label={certificate.status}
                                        color={getStatusColor(certificate.status)}
                                        size="small"
                                    />
                                    <Chip
                                        label={certificate.file_type.toUpperCase()}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                <Tooltip title="View Certificate">
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePreviewOpen(certificate)}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                    <IconButton
                                        size="small"
                                        onClick={() => onDownload(certificate)}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Certificate Preview Dialog */}
            <Dialog
                open={previewOpen}
                onClose={handlePreviewClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box>
                        <Typography variant="h6" component="div">
                            Certificate Preview
                        </Typography>
                        {selectedCertificate && (
                            <Typography variant="body2" color="text.secondary">
                                {selectedCertificate.certificate_name}
                            </Typography>
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedCertificate && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '400px',
                            bgcolor: 'grey.100',
                            borderRadius: 1
                        }}>
                            {selectedCertificate.file_type === 'pdf' ? (
                                <iframe
                                    src={selectedCertificate.file_url}
                                    style={{
                                        width: '100%',
                                        height: '500px',
                                        border: 'none'
                                    }}
                                    title="Certificate Preview"
                                />
                            ) : (
                                <img
                                    src={selectedCertificate.file_url}
                                    alt="Certificate Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePreviewClose}>Close</Button>
                    {selectedCertificate && (
                        <Button
                            startIcon={<DownloadIcon />}
                            onClick={() => onDownload(selectedCertificate)}
                        >
                            Download
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Certificate Actions Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handlePreviewOpen(selectedCertForMenu);
                }}>
                    <ListItemIcon>
                        <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    onDownload(selectedCertForMenu);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Download</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    onStatusChange(selectedCertForMenu);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Change Status</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onDelete(selectedCertForMenu);
                        handleMenuClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default CertificateViewer; 