const db = require('../config/db');
const { DataTypes } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const Certificate = db.define('Certificate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Classes',
            key: 'id'
        }
    },
    certificate_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    certificate_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cloudinary_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Cloudinary public ID for the uploaded certificate'
    },
    file_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Type of the certificate file (pdf, jpg, png)'
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Size of the certificate file in bytes'
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'revoked'),
        defaultValue: 'active'
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'ID of the admin who uploaded the certificate'
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'certificates',
    timestamps: true
});

// Static methods
Certificate.getById = async (id) => {
    return await Certificate.findByPk(id);
};

Certificate.getByUserId = async (userId) => {
    return await Certificate.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']]
    });
};

Certificate.delete = async (id, userId) => {
    const certificate = await Certificate.getById(id);
    if (certificate && certificate.cloudinary_id) {
        // Delete from Cloudinary if exists
        const cloudinary = require('../config/cloudinary').cloudinary;
        await cloudinary.uploader.destroy(certificate.cloudinary_id);
    }
    return await Certificate.destroy({
        where: { id, user_id: userId }
    });
};

Certificate.create = async ({ user_id, class_id, certificate_name, certificate_url, metadata = {} }) => {
    const verificationCode = Certificate.generateVerificationCode();
    const values = {
        user_id, class_id, certificate_name, certificate_url,
        metadata, verificationCode
    };
    const certificate = await Certificate.create(values);
    return certificate;
};

Certificate.verifyCertificate = async (verificationCode) => {
    return await Certificate.findOne({
        where: { verification_code: verificationCode }
    });
};

Certificate.generateCertificate = async (certificateId) => {
    const certificate = await Certificate.getById(certificateId);
    if (!certificate) {
        throw new Error('Certificate not found');
    }

    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape'
    });

    // Add certificate content
    doc.fontSize(30)
       .text('Certificate of Completion', 50, 100);

    doc.fontSize(24)
       .text(`${certificate.first_name} ${certificate.last_name}`, 50, 200);

    doc.fontSize(18)
       .text(`has successfully completed`, 50, 250)
       .text(certificate.class_title, 50, 280);

    doc.fontSize(14)
       .text(`Issued on: ${new Date(certificate.issue_date).toLocaleDateString()}`, 50, 350);

    // Generate and add QR code for verification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${certificate.verification_code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    doc.image(qrCodeDataUrl, 50, 400, { width: 100 });

    // Add verification text
    doc.fontSize(12)
       .text(`Verification Code: ${certificate.verification_code}`, 50, 520);

    // Save the certificate
    const certificatePath = path.join(__dirname, '../certificates', `${certificate.verification_code}.pdf`);
    const stream = fs.createWriteStream(certificatePath);
    doc.pipe(stream);
    doc.end();

    // Update certificate URL
    await Certificate.updateCertificateUrl(certificateId, `/certificates/${certificate.verification_code}.pdf`);

    return certificatePath;
};

Certificate.updateCertificateUrl = async (certificateId, url) => {
    return await Certificate.update({ certificate_url: url }, {
        where: { id: certificateId }
    });
};

Certificate.generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

Certificate.generateClassCertificates = async (classId) => {
    // Get all approved enrollments for the class
    const enrollments = await db.query(`
        SELECT 
            u.id as user_id,
            u.first_name,
            u.last_name,
            c.title as class_title
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN classes c ON e.class_id = c.id
        WHERE e.class_id = $1 
        AND e.enrollment_status = 'approved'
        AND NOT EXISTS (
            SELECT 1 FROM certificates 
            WHERE user_id = u.id AND class_id = $1
        )
    `, { replacements: [classId], type: db.QueryTypes.SELECT });

    const generatedCertificates = [];
    for (const enrollment of enrollments) {
        const certificate = await Certificate.create({
            user_id: enrollment.user_id,
            class_id: classId,
            certificate_name: `${enrollment.class_title} Certificate`,
            certificate_url: null,
            metadata: { generated_by: 'system' }
        });

        await Certificate.generateCertificate(certificate.id);
        generatedCertificates.push(certificate);
    }

    return generatedCertificates;
};

module.exports = Certificate; 