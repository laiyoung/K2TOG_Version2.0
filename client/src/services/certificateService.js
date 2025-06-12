// Helper function to handle fetch requests
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    // Use the full URL with the proxy path
    const response = await fetch(`/api${url}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get('content-type');

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        let errorData = {};
        if (contentType && contentType.includes('application/json')) {
            errorData = await response.json().catch(() => ({}));
        } else {
            const text = await response.text();
            errorData = { error: `Non-JSON error response: ${text}` };
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // For blob responses (like downloads)
    if (options.responseType === 'blob') {
        return response.blob();
    }

    // For JSON responses
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text}`);
    }
};

// Helper function for FormData requests
const fetchWithFormData = async (url, formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api${url}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Do NOT set Content-Type for FormData!
        },
        body: formData
    });

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.text();
        console.error('Request failed:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Get all certificates
export const getAllCertificates = async () => {
    return fetchWithAuth('/certificates');
};

// Get certificates by user ID
export const getCertificatesByUserId = async (userId) => {
    return fetchWithAuth(`/certificates/user/${userId}`);
};

// Upload certificate
export const uploadCertificate = async (studentId, file, classId) => {
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('class_id', classId);
    
    return fetchWithFormData(`/certificates/upload/${studentId}`, formData);
};

// Download certificate
export const downloadCertificate = async (certificateId) => {
    return fetchWithAuth(`/certificates/${certificateId}/download`, {
        responseType: 'blob'
    });
};

// Delete certificate
export const deleteCertificate = async (certificateId) => {
    return fetchWithAuth(`/certificates/${certificateId}`, {
        method: 'DELETE'
    });
};

// Verify certificate
export const verifyCertificate = async (verificationCode) => {
    return fetchWithAuth(`/certificates/verify/${verificationCode}`);
};

// Generate certificate
export const generateCertificate = async (userId, classId, certificateName) => {
    return fetchWithAuth('/certificates/generate', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, class_id: classId, certificate_name: certificateName })
    });
};

// Generate certificates for a class
export const generateClassCertificates = async (classId) => {
    return fetchWithAuth(`/certificates/generate-class/${classId}`, {
        method: 'POST'
    });
}; 