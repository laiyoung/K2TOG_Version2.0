// Mock authentication middleware to properly handle unauthorized requests
jest.mock('../middleware/auth', () => (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        req.user = { id: 2, role: 'student' };
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
});

// Mock bcrypt and other dependencies
jest.mock('bcrypt');
jest.mock('../utils/sendEmail');

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Mock the models with proper function definitions
jest.mock('../models/userModel', () => ({
    getProfileWithDetails: jest.fn(),
    updateProfile: jest.fn(),
    getUserById: jest.fn().mockImplementation((id) => {
        console.log('MOCK User.getUserById called with:', id);
        return Promise.resolve({ 
            id: 2, 
            password: 'hashed_password',
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
            status: 'active',
            email_notifications: true,
            sms_notifications: false
        });
    }),
    updatePassword: jest.fn().mockResolvedValue(true)
}));

jest.mock('../models/certificateModel', () => ({
    getByUserId: jest.fn().mockResolvedValue([
        {
            id: 1,
            user_id: 2,
            name: 'Test Certificate',
            issue_date: new Date().toISOString()
        }
    ])
}));

jest.mock('../models/paymentMethodModel', () => ({
    getByUserId: jest.fn().mockResolvedValue([
        {
            id: 1,
            user_id: 2,
            payment_type: 'credit_card',
            last_four: '1234',
            expiry_date: '12/25',
            is_default: true
        }
    ]),
    create: jest.fn().mockResolvedValue({
        id: 1,
        user_id: 2,
        payment_type: 'credit_card',
        last_four: '1234',
        expiry_date: '12/25',
        is_default: true
    }),
    setDefault: jest.fn().mockResolvedValue({
        id: 1,
        user_id: 2,
        is_default: true
    }),
    delete: jest.fn().mockResolvedValue({
        id: 1,
        user_id: 2
    })
}));

jest.mock('../models/activityLogModel', () => ({
    getByUserId: jest.fn().mockResolvedValue([
        {
            id: 1,
            user_id: 2,
            action: 'profile_update',
            details: { updated_fields: ['name'] },
            created_at: new Date().toISOString()
        }
    ]),
    createActivityLog: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn().mockResolvedValue({ id: 1 })
}));

jest.mock('../models/notificationModel', () => ({
    getByUserId: jest.fn().mockResolvedValue([
        {
            id: 1,
            user_id: 2,
            title: 'Test Notification',
            message: 'Test message',
            is_read: false,
            created_at: new Date().toISOString()
        }
    ]),
    getUnreadCount: jest.fn().mockResolvedValue(1),
    markAsRead: jest.fn().mockResolvedValue({
        id: 1,
        user_id: 2,
        is_read: true
    }),
    markAllAsRead: jest.fn().mockResolvedValue([
        { id: 1, is_read: true },
        { id: 2, is_read: true }
    ])
}));

// Import app and other dependencies after mocks
const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Get the mocked models
const User = require('../models/userModel');
const Certificate = require('../models/certificateModel');
const PaymentMethod = require('../models/paymentMethodModel');
const ActivityLog = require('../models/activityLogModel');
const Notification = require('../models/notificationModel');

describe('Profile Routes', () => {
    let adminToken;
    let userToken;
    let testUserId;

    beforeAll(async () => {
        // Generate tokens for testing
        adminToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        userToken = jwt.sign({ id: 2, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        testUserId = 2;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('Profile Management', () => {
        describe('GET /api/profile/profile', () => {
            it('should get user profile with valid token', async () => {
                const mockProfile = {
                    id: testUserId,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'student',
                    status: 'active',
                    email_notifications: true,
                    sms_notifications: false
                };

                User.getProfileWithDetails.mockResolvedValue(mockProfile);

                const res = await request(app)
                    .get('/api/profile/profile')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockProfile);
                expect(User.getProfileWithDetails).toHaveBeenCalledWith(testUserId);
            });

            it('should fail without token', async () => {
                const res = await request(app)
                    .get('/api/profile/profile');

                expect(res.status).toBe(401);
                expect(res.body).toHaveProperty('error', 'Authentication required');
            });
        });

        describe('PUT /api/profile/profile', () => {
            it('should update user profile successfully', async () => {
                const mockUpdatedProfile = {
                    id: testUserId,
                    name: 'Updated Name',
                    email: 'test@example.com',
                    role: 'student',
                    status: 'active',
                    email_notifications: true,
                    sms_notifications: true,
                    phone_number: '1234567890'
                };

                User.updateProfile.mockResolvedValue(mockUpdatedProfile);
                ActivityLog.createActivityLog.mockResolvedValue({ id: 1 });

                const res = await request(app)
                    .put('/api/profile/profile')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        name: 'Updated Name',
                        phone_number: '1234567890',
                        email_notifications: true,
                        sms_notifications: true
                    });

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockUpdatedProfile);
                expect(User.updateProfile).toHaveBeenCalledWith(testUserId, expect.any(Object));
                expect(ActivityLog.createActivityLog).toHaveBeenCalled();
            });
        });

        describe('PUT /api/profile/profile/password', () => {
            beforeEach(() => {
                // Clear all mocks before each test
                jest.clearAllMocks();
                // Reset the mock implementation
                User.getUserById.mockImplementation((id) => {
                    console.log('MOCK User.getUserById called with:', id);
                    return Promise.resolve({ 
                        id: 2, 
                        password: 'hashed_password',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'student',
                        status: 'active',
                        email_notifications: true,
                        sms_notifications: false
                    });
                });
            });

            it('should update password successfully', async () => {
                // Debug logs
                console.log('TEST: Starting password update test');
                console.log('TEST: Mock getUserById implementation:', User.getUserById.getMockImplementation());

                require('bcrypt').compare.mockResolvedValue(true);
                require('bcrypt').hash.mockResolvedValue('new_hashed_password');

                // Debug log
                console.log('TEST: req.user.id', testUserId);

                const res = await request(app)
                    .put('/api/profile/profile/password')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        currentPassword: 'oldpassword',
                        newPassword: 'newpassword'
                    });

                console.log('TEST: password update response', res.status, res.body);
                console.log('TEST: Mock getUserById calls:', User.getUserById.mock.calls);
                console.log('TEST: Mock updatePassword calls:', User.updatePassword.mock.calls);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Password updated successfully');
                expect(User.updatePassword).toHaveBeenCalled();
                expect(ActivityLog.createActivityLog).toHaveBeenCalled();
            });

            it('should fail with incorrect current password', async () => {
                // Debug logs
                console.log('TEST: Starting incorrect password test');

                require('bcrypt').compare.mockResolvedValue(false);

                const res = await request(app)
                    .put('/api/profile/profile/password')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        currentPassword: 'wrongpassword',
                        newPassword: 'newpassword'
                    });

                console.log('TEST: incorrect password response', res.status, res.body);
                console.log('TEST: Mock getUserById calls:', User.getUserById.mock.calls);

                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('message', 'Current password is incorrect');
            });
        });
    });

    describe('Certificate Management', () => {
        describe('GET /api/profile/certificates', () => {
            it('should get user certificates', async () => {
                const mockCertificates = [
                    {
                        id: 1,
                        user_id: testUserId,
                        name: 'Test Certificate',
                        issue_date: new Date().toISOString()
                    }
                ];

                Certificate.getByUserId.mockResolvedValue(mockCertificates);

                const res = await request(app)
                    .get('/api/profile/certificates')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockCertificates);
                expect(Certificate.getByUserId).toHaveBeenCalledWith(testUserId);
            });
        });
    });

    describe('Payment Method Management', () => {
        describe('GET /api/profile/payment-methods', () => {
            it('should get user payment methods', async () => {
                const mockPaymentMethods = [
                    {
                        id: 1,
                        user_id: testUserId,
                        payment_type: 'credit_card',
                        last_four: '1234',
                        is_default: true
                    }
                ];

                PaymentMethod.getByUserId.mockResolvedValue(mockPaymentMethods);

                const res = await request(app)
                    .get('/api/profile/payment-methods')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockPaymentMethods);
                expect(PaymentMethod.getByUserId).toHaveBeenCalledWith(testUserId);
            });
        });

        describe('POST /api/profile/payment-methods', () => {
            it('should add a new payment method', async () => {
                const mockPaymentMethod = {
                    id: 1,
                    user_id: testUserId,
                    payment_type: 'credit_card',
                    last_four: '1234',
                    expiry_date: '12/25',
                    is_default: true
                };

                const res = await request(app)
                    .post('/api/profile/payment-methods')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        payment_type: 'credit_card',
                        last_four: '1234',
                        expiry_date: '12/25',
                        is_default: true
                    });

                console.log('TEST: add payment method response', res.status, res.body);

                expect(res.status).toBe(201);
                expect(res.body).toEqual(mockPaymentMethod);
                expect(require('../models/paymentMethodModel').create).toHaveBeenCalled();
                expect(require('../models/activityLogModel').create).toHaveBeenCalled();
            });
        });

        describe('PUT /api/profile/payment-methods/:id/default', () => {
            it('should set a payment method as default', async () => {
                const mockPaymentMethod = {
                    id: 1,
                    user_id: testUserId,
                    is_default: true
                };

                const res = await request(app)
                    .put('/api/profile/payment-methods/1/default')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockPaymentMethod);
                expect(require('../models/paymentMethodModel').setDefault).toHaveBeenCalledWith('1', testUserId);
                expect(require('../models/activityLogModel').create).toHaveBeenCalled();
            });
        });

        describe('DELETE /api/profile/payment-methods/:id', () => {
            it('should delete a payment method', async () => {
                const mockPaymentMethod = {
                    id: 1,
                    user_id: testUserId
                };

                const res = await request(app)
                    .delete('/api/profile/payment-methods/1')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Payment method deleted successfully');
                expect(require('../models/paymentMethodModel').delete).toHaveBeenCalledWith('1', testUserId);
                expect(require('../models/activityLogModel').create).toHaveBeenCalled();
            });
        });
    });

    describe('Activity Log Management', () => {
        describe('GET /api/profile/activity', () => {
            it('should get user activity log', async () => {
                const mockActivities = [
                    {
                        id: 1,
                        user_id: testUserId,
                        action: 'profile_update',
                        details: { updated_fields: ['name'] },
                        created_at: new Date().toISOString()
                    }
                ];

                ActivityLog.getByUserId.mockResolvedValue(mockActivities);

                const res = await request(app)
                    .get('/api/profile/activity')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockActivities);
                expect(ActivityLog.getByUserId).toHaveBeenCalledWith(testUserId, 50, 0);
            });
        });
    });

    describe('Notification Management', () => {
        describe('GET /api/profile/notifications', () => {
            it('should get user notifications', async () => {
                const mockNotifications = [
                    {
                        id: 1,
                        user_id: testUserId,
                        title: 'Test Notification',
                        message: 'Test message',
                        is_read: false,
                        created_at: new Date().toISOString()
                    }
                ];

                Notification.getByUserId.mockResolvedValue(mockNotifications);
                Notification.getUnreadCount.mockResolvedValue(1);

                const res = await request(app)
                    .get('/api/profile/notifications')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('notifications');
                expect(res.body).toHaveProperty('unreadCount', 1);
                expect(res.body.notifications).toEqual(mockNotifications);
            });
        });

        describe('PUT /api/profile/notifications/:id/read', () => {
            it('should mark a notification as read', async () => {
                const mockNotification = {
                    id: 1,
                    user_id: testUserId,
                    is_read: true
                };

                const res = await request(app)
                    .put('/api/profile/notifications/1/read')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(mockNotification);
                expect(require('../models/notificationModel').markAsRead).toHaveBeenCalledWith('1', testUserId);
            });
        });

        describe('PUT /api/profile/notifications/read-all', () => {
            it('should mark all notifications as read', async () => {
                const mockNotifications = [
                    { id: 1, is_read: true },
                    { id: 2, is_read: true }
                ];

                Notification.markAllAsRead.mockResolvedValue(mockNotifications);

                const res = await request(app)
                    .put('/api/profile/notifications/read-all')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'All notifications marked as read');
                expect(res.body).toHaveProperty('count', 2);
                expect(Notification.markAllAsRead).toHaveBeenCalledWith(testUserId);
            });
        });
    });
}); 