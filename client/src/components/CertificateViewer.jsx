import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Chip,
    Grid,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Button,
    Paper
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    MoreVert as MoreIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    CheckCircle as ActiveIcon,
    Cancel as RevokedIcon,
    Timer as ExpiredIcon
} from '@mui/icons-material';

const CertificateViewer = ({ certificates = [], onDownload, onDelete }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedCertForMenu, setSelectedCertForMenu] = useState(null);
    const [selectedCertificates, setSelectedCertificates] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Debug: Log certificates data to see what's being received
    console.log('CertificateViewer received certificates:', certificates);
    console.log('Sample certificate data:', certificates[0]);

    // Update selectAll when all certificates are selected/deselected
    useEffect(() => {
        if (certificates.length > 0) {
            setSelectAll(selectedCertificates.size === certificates.length);
        }
    }, [selectedCertificates, certificates]);

    const handleMenuOpen = (event, certificate) => {
        setMenuAnchor(event.currentTarget);
        setSelectedCertForMenu(certificate);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedCertForMenu(null);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allIds = new Set(certificates.map(cert => cert.id));
            setSelectedCertificates(allIds);
        } else {
            setSelectedCertificates(new Set());
        }
        setSelectAll(event.target.checked);
    };

    const handleSelectCertificate = (certificateId) => {
        const newSelected = new Set(selectedCertificates);
        if (newSelected.has(certificateId)) {
            newSelected.delete(certificateId);
        } else {
            newSelected.add(certificateId);
        }
        setSelectedCertificates(newSelected);
    };

    const handleBulkDelete = () => {
        if (selectedCertificates.size > 0) {
            if (window.confirm(`Are you sure you want to delete ${selectedCertificates.size} certificate(s)?`)) {
                selectedCertificates.forEach(certId => {
                    onDelete({ id: certId });
                });
                setSelectedCertificates(new Set());
                setSelectAll(false);
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <ActiveIcon color="success" />;
            case 'pending':
                return <ExpiredIcon color="warning" />;
            case 'rejected':
                return <RevokedIcon color="error" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
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
            {/* Bulk Actions Bar */}
            {selectedCertificates.size > 0 && (
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText'
                    }}
                >
                    <Typography>
                        {selectedCertificates.size} certificate(s) selected
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleBulkDelete}
                    >
                        Delete Selected
                    </Button>
                </Paper>
            )}

            {/* Select All Checkbox */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={selectedCertificates.size > 0 && selectedCertificates.size < certificates.length}
                />
                <Typography variant="body2" color="text.secondary">
                    Select All
                </Typography>
            </Box>

            <Grid container spacing={3} alignItems="stretch">
                {certificates.map((certificate) => (
                    <Grid
                        key={certificate.id}
                        sx={{
                            width: {
                                xs: '100%',
                                sm: '50%',
                                md: '33.33%'
                            }
                        }}
                    >
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                border: selectedCertificates.has(certificate.id) ? '2px solid' : 'none',
                                borderColor: 'primary.main'
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 2
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                                        <Checkbox
                                            checked={selectedCertificates.has(certificate.id)}
                                            onChange={() => handleSelectCertificate(certificate.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Tooltip title={certificate.file_type === 'application/pdf' ? 'PDF File' : 'Image File'} placement="top" arrow>
                                            {certificate.file_type === 'application/pdf' ? (
                                                <PdfIcon color="error" />
                                            ) : (
                                                <ImageIcon color="primary" />
                                            )}
                                        </Tooltip>
                                        <Tooltip
                                            title={
                                                <Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>
                                                    {certificate.certificate_name}
                                                </Typography>
                                            }
                                            placement="top"
                                            arrow
                                            sx={{
                                                '& .MuiTooltip-tooltip': {
                                                    fontSize: '1.1rem',
                                                    fontWeight: 500,
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flex: 1,
                                                    minWidth: 0
                                                }}
                                            >
                                                {certificate.certificate_name}
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                    <Tooltip
                                        title={<Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>More Actions</Typography>}
                                        placement="top"
                                        arrow
                                        sx={{ '& .MuiTooltip-tooltip': { fontSize: '1rem', fontWeight: 400 } }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, certificate)}
                                            sx={{ flexShrink: 0, ml: 1 }}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Student: {certificate.student_name || 'Not Assigned'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Class: {certificate.class_name || 'N/A'}
                                    </Typography>
                                    {certificate.session_date && (
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Session: {formatDate(certificate.session_date)} {certificate.start_time && certificate.end_time && `(${certificate.start_time} - ${certificate.end_time})`}
                                        </Typography>
                                    )}
                                    {certificate.expiration_date && (
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Expires: {formatDate(certificate.expiration_date)}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Uploaded: {certificate.upload_date ? formatDate(certificate.upload_date) : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Size: {certificate.file_size ? formatFileSize(certificate.file_size) : 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={getStatusIcon(certificate.status)}
                                        label={certificate.status || 'Unknown'}
                                        color={getStatusColor(certificate.status)}
                                        size="small"
                                    />
                                    <Chip
                                        label={(certificate.file_type || 'Unknown').toUpperCase()}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                <Tooltip title={<Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>Download</Typography>} placement="top" arrow sx={{ '& .MuiTooltip-tooltip': { fontSize: '1rem', fontWeight: 400 } }}>
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

            {/* Certificate Actions Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    onDownload(selectedCertForMenu);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Download</ListItemText>
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