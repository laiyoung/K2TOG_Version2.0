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
    params: {
        folder: 'yj-childcare-certificates',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        transformation: [{ quality: 'auto:good' }],
        resource_type: 'auto'
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