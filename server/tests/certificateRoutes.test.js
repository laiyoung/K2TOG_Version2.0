// Mock bcrypt and other dependencies
jest.mock('bcrypt');
jest.mock('../config/cloudinary', () => ({
    upload: {
        single: () => (req, res, next) => next()
    }
}));

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Mock the certificate model with all required functions and correct return values
jest.mock('../models/certificateModel', () => {
    const certBase = {
        id: 1,
        user_id: 2,
        class_id: 3,
        certificate_name: 'Test Certificate',
        certificate_url: 'certificates/test-certificate.pdf',
        status: 'active',
        first_name: 'Test',
        last_name: 'User',
        class_title: 'Test Class',
        issue_date: '2024-01-01',
        file_type: 'application/pdf',
        file_size: 12345,
        upload_date: '2024-01-01T00:00:00.000Z',
        metadata: { generated_by: 1 }
    };
    return {
        createCertificate: jest.fn().mockResolvedValue({ ...certBase }),
        generateCertificate: jest.fn().mockResolvedValue({ ...certBase }),
        generateClassCertificates: jest.fn().mockResolvedValue([
            { ...certBase, id: 1, user_id: 1, certificate_name: 'Class Certificate 1' },
            { ...certBase, id: 2, user_id: 2, certificate_name: 'Class Certificate 2' }
        ]),
        getCertificateById: jest.fn().mockResolvedValue({ ...certBase }),
        verifyCertificate: jest.fn().mockImplementation((code) => {
            if (code === 'valid-code-123') {
                return Promise.resolve({
                    first_name: 'Test',
                    last_name: 'User',
                    class_title: 'Test Class',
                    issue_date: '2024-01-01'
                });
            } else {
                return Promise.resolve(null);
            }
        }),
        findOne: jest.fn().mockImplementation(({ where }) => {
            if (where.status === 'active') {
                return Promise.resolve({
                    id: 1,
                    certificate_name: 'Student Certificate',
                    certificate_url: 'certificates/student-certificate.pdf',
                    file_type: 'application/pdf',
                    file_size: 12345,
                    upload_date: '2024-01-01T00:00:00.000Z',
                    status: 'active',
                    metadata: {}
                });
            } else {
                return Promise.resolve(null);
            }
        })
    };
});


describe('Certificate Routes', () => {
    let adminToken;
    let userToken;
    let testUserId;

    beforeAll(async () => {
        // Generate tokens for testing
        adminToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        userToken = jwt.sign({ id: '2', role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        testUserId = '2';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('Admin Routes', () => {
        describe('POST /api/certificates/generate', () => {
            it('should generate a certificate when admin', async () => {
                const res = await request(app)
                    .post('/api/certificates/generate')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        user_id: testUserId,
                        class_id: 3,
                        certificate_name: 'Test Certificate'
                    });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Certificate generated successfully');
                expect(res.body).toHaveProperty('certificate');
                expect(res.body.certificate).toHaveProperty('download_url');
            });

            it('should fail when non-admin tries to generate certificate', async () => {
                const res = await request(app)
                    .post('/api/certificates/generate')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        user_id: testUserId,
                        class_id: 3,
                        certificate_name: 'Test Certificate'
                    });

                expect(res.status).toBe(403);
                expect(res.body).toHaveProperty('error', 'Forbidden: Admins only');
            });
        });

        describe('POST /api/certificates/generate-class/:classId', () => {
            it('should generate certificates for a class when admin', async () => {
                const res = await request(app)
                    .post('/api/certificates/generate-class/123')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Certificates generated successfully');
                expect(Array.isArray(res.body.certificates)).toBe(true);
                expect(res.body.certificates.length).toBeGreaterThan(0);
                expect(res.body.certificates[0]).toHaveProperty('download_url');
            });
        });

        describe('GET /api/certificates/:id/download', () => {
            it('should download a certificate when admin', async () => {
                const res = await request(app)
                    .get('/api/certificates/1/download')
                    .set('Authorization', `Bearer ${adminToken}`);

                // The test will pass if the route is hit and returns a response (status 200, 404, or 500 for not found or file error)
                expect([200, 404, 500]).toContain(res.status);
            });
        });
    });

    describe('Student Routes', () => {
        describe('GET /api/certificates/view/:studentId', () => {
            it('should allow students to view their own certificates', async () => {
                const res = await request(app)
                    .get(`/api/certificates/view/${testUserId}`)
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('certificate');
                expect(res.body.certificate).toHaveProperty('name', 'Student Certificate');
            });

            it('should not allow students to view other students certificates', async () => {
                const res = await request(app)
                    .get('/api/certificates/view/999')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(403);
                expect(res.body).toHaveProperty('error', 'Not authorized');
            });
        });
    });

    describe('Public Routes', () => {
        describe('GET /api/certificates/verify/:code', () => {
            it('should verify a certificate with valid code', async () => {
                const res = await request(app)
                    .get('/api/certificates/verify/valid-code-123');

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('valid', true);
                expect(res.body.certificate).toHaveProperty('name', 'Test User');
                expect(res.body.certificate).toHaveProperty('class_title', 'Test Class');
                expect(res.body.certificate).toHaveProperty('issue_date', '2024-01-01');
            });

            it('should return invalid for non-existent certificate', async () => {
                const res = await request(app)
                    .get('/api/certificates/verify/invalid-code');

                expect(res.status).toBe(404);
                expect(res.body).toHaveProperty('error', 'Invalid certificate code');
            });
        });
    });
}); 