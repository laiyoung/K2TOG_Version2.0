import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import CertificateViewer from '../../components/CertificateViewer';
import CertificateUpload from '../../components/CertificateUpload';
import { mockData } from '../../mockData/adminDashboardData';

const CertificateManagementPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [alert, setAlert] = useState(null);

    // Mock data - replace with actual API calls later
    const certificates = mockData.certificates;
    const students = mockData.users;

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleUploadClick = () => {
        setShowUploadDialog(true);
    };

    const handleUploadClose = () => {
        setShowUploadDialog(false);
        setSelectedStudent('');
    };

    const handleUpload = (file) => {
        // This will be replaced with actual API call
        console.log('Uploading file for student:', selectedStudent, file);
        setAlert({
            type: 'success',
            message: 'Certificate uploaded successfully'
        });
        handleUploadClose();
    };

    const handleDownload = (certificate) => {
        // This will be replaced with actual API call
        console.log('Downloading certificate:', certificate);
    };

    const handleDelete = (certificate) => {
        // This will be replaced with actual API call
        console.log('Deleting certificate:', certificate);
        setAlert({
            type: 'success',
            message: 'Certificate deleted successfully'
        });
    };

    const handleStatusChange = (certificate) => {
        // This will be replaced with actual API call
        console.log('Changing status for certificate:', certificate);
    };

    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = cert.certificate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.student_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Typography variant="h4" component="h1">
                        Certificate Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleUploadClick}
                    >
                        Upload Certificate
                    </Button>
                </Box>

                {/* Alert Messages */}
                {alert && (
                    <Alert
                        severity={alert.type}
                        sx={{ mb: 2 }}
                        onClose={() => setAlert(null)}
                    >
                        {alert.message}
                    </Alert>
                )}

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search certificates..."
                            value={searchQuery}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <IconButton
                            onClick={() => setShowFilters(!showFilters)}
                            color={showFilters ? 'primary' : 'default'}
                        >
                            <FilterIcon />
                        </IconButton>
                    </Box>

                    {/* Filters */}
                    {showFilters && (
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            mt: 2,
                            alignItems: 'center'
                        }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="expired">Expired</MenuItem>
                                    <MenuItem value="revoked">Revoked</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Paper>

                {/* Certificate Viewer */}
                <CertificateViewer
                    certificates={filteredCertificates}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />

                {/* Upload Dialog */}
                <Dialog
                    open={showUploadDialog}
                    onClose={handleUploadClose}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Upload New Certificate
                        <IconButton
                            aria-label="close"
                            onClick={handleUploadClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 3, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Select Student</InputLabel>
                                <Select
                                    value={selectedStudent}
                                    label="Select Student"
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                >
                                    {students.map((student) => (
                                        <MenuItem key={student.id} value={student.id}>
                                            {student.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <CertificateUpload
                            onUpload={handleUpload}
                            studentId={selectedStudent}
                            disabled={!selectedStudent}
                        />
                    </DialogContent>
                </Dialog>
            </Box>
        </Container>
    );
};

export default CertificateManagementPage; 