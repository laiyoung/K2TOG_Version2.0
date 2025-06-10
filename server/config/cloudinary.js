const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const timestamp = Date.now();
        const originalName = file.originalname.split('.')[0];
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'yj-childcare-certificates',
            resource_type: isPdf ? 'raw' : 'image',
            allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
            public_id: isPdf
                ? `${sanitizedName}_${timestamp}.pdf`
                : `${sanitizedName}_${timestamp}`,
            transformation: !isPdf ? [{ fetch_format: 'auto' }] : undefined,
            type: 'upload' // Ensure all uploads are public
        };
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only PDF and image files
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'image/jpeg' || 
            file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and images (JPEG, PNG) are allowed.'), false);
        }
    }
});

module.exports = {
    cloudinary,
    upload
}; 