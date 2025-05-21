// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Mock the User model
jest.mock('../models/userModel', () => ({
    getUsersByIds: jest.fn().mockImplementation((ids) => {
        return Promise.resolve(ids.map(id => ({ id })));
    }),
    getUsersByStatus: jest.fn().mockImplementation((status) => {
        return Promise.resolve([
            { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
        ]);
    })
}));

// Mock authentication middleware to properly decode JWT tokens
jest.mock('../middleware/authMiddleware', () => ({
    requireAuth: (req, res, next) => {
        if (req.headers && req.headers.authorization) {
            try {
                // In test environment, we know our tokens are base64 encoded JSON
                const token = req.headers.authorization.split(' ')[1];
                const base64Payload = token.split('.')[1];
                const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
                req.user = {
                    id: payload.id,
                    role: payload.role
                };
                next();
            } catch (error) {
                res.status(401).json({ error: 'Invalid token' });
            }
        } else {
            res.status(401).json({ error: 'Authentication required' });
        }
    },
    requireAdmin: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Admin access required' });
        }
    }
}));

// Mock the notification model with all required functions
jest.mock('../models/notificationModel', () => ({
    getByUserId: jest.fn().mockImplementation((userId, options = {}) => {
        console.log('Mock getByUserId called with:', userId, options);
        return Promise.resolve({
            notifications: [
                {
                    id: 1,
                    user_id: userId,
                    title: 'Test Notification',
                    message: 'This is a test notification',
                    type: 'info',
                    read: false,
                    created_at: new Date().toISOString()
                }
            ],
            pagination: {
                total: 1,
                page: options.page || 1,
                limit: options.limit || 10
            }
        });
    }),
    getUnreadCount: jest.fn().mockImplementation((userId) => {
        console.log('Mock getUnreadCount called with:', userId);
        return Promise.resolve(1);
    }),
    markAsRead: jest.fn().mockImplementation((id, userId) => {
        console.log('Mock markAsRead called with:', id, userId);
        return Promise.resolve({
            id: parseInt(id),
            user_id: userId,
            read: true
        });
    }),
    markAllAsRead: jest.fn().mockImplementation((userId) => {
        console.log('Mock markAllAsRead called with:', userId);
        return Promise.resolve([
            { id: 1, read: true },
            { id: 2, read: true }
        ]);
    }),
    createTemplate: jest.fn().mockImplementation((templateData) => {
        console.log('Mock createTemplate called with:', templateData);
        return Promise.resolve({
            id: 1,
            ...templateData
        });
    }),
    getAllTemplates: jest.fn().mockImplementation(() => {
        console.log('Mock getAllTemplates called');
        return Promise.resolve([
            {
                id: 1,
                name: 'template1',
                type: 'info',
                title_template: 'Test Title',
                message_template: 'Test Message'
            }
        ]);
    }),
    createBulkFromTemplate: jest.fn().mockImplementation((templateName, userIds, variables, actionUrl) => {
        console.log('Mock createBulkFromTemplate called with:', { templateName, userIds, variables, actionUrl });
        return Promise.resolve({
            success: true,
            sent_count: userIds.length,
            failed_count: 0,
            message: 'Bulk notification sent successfully'
        });
    }),
    broadcastNotification: jest.fn().mockImplementation((templateName, variables, actionUrl) => {
        console.log('Mock broadcastNotification called with:', { templateName, variables, actionUrl });
        return Promise.resolve({
            success: true,
            sent_count: 10,
            message: 'Broadcast notification sent successfully'
        });
    })
}));

// Get the mocked models
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

describe('Notification Routes', () => {
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

    describe('User Notification Routes', () => {
        describe('GET /api/notifications', () => {
            it('should get user notifications', async () => {
                const res = await request(app)
                    .get('/api/notifications')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('notifications');
                expect(res.body.notifications).toBeInstanceOf(Array);
                expect(res.body.notifications[0]).toHaveProperty('id');
                expect(res.body.notifications[0]).toHaveProperty('title');
                expect(res.body.notifications[0]).toHaveProperty('message');
                expect(res.body.notifications[0]).toHaveProperty('read');
                expect(res.body).toHaveProperty('pagination');
            });

            it('should return 401 if not authenticated', async () => {
                const res = await request(app)
                    .get('/api/notifications');

                expect(res.status).toBe(401);
                expect(res.body).toHaveProperty('error');
            });
        });

        describe('PUT /api/notifications/:id/read', () => {
            it('should mark notification as read', async () => {
                Notification.markAsRead.mockResolvedValue({
                    id: 1,
                    user_id: 2,
                    read: true
                });

                const res = await request(app)
                    .put('/api/notifications/1/read')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('id', 1);
                expect(res.body).toHaveProperty('read', true);
            });
        });

        describe('PUT /api/notifications/read-all', () => {
            it('should mark all notifications as read', async () => {
                Notification.markAllAsRead.mockResolvedValue([
                    { id: 1, read: true },
                    { id: 2, read: true }
                ]);

                const res = await request(app)
                    .put('/api/notifications/read-all')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message');
                expect(res.body).toHaveProperty('count');
            });
        });
    });

    describe('Admin Notification Routes', () => {
        describe('POST /api/notifications/admin/templates', () => {
            it('should create a notification template', async () => {
                const templateData = {
                    name: 'test_template',
                    type: 'info',
                    title_template: 'Test Title',
                    message_template: 'Test Message'
                };

                const res = await request(app)
                    .post('/api/notifications/admin/templates')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(templateData);

                expect(res.status).toBe(201);
                expect(res.body).toMatchObject({
                    id: expect.any(Number),
                    ...templateData
                });
                expect(Notification.createTemplate).toHaveBeenCalledWith(templateData);
            });

            it('should return 403 when non-admin tries to create template', async () => {
                const res = await request(app)
                    .post('/api/notifications/admin/templates')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        name: 'test_template',
                        type: 'info',
                        title_template: 'Test Title',
                        message_template: 'Test Message'
                    });

                expect(res.status).toBe(403);
                expect(res.body).toHaveProperty('error', 'Admin access required');
            });
        });

        describe('GET /api/notifications/admin/templates', () => {
            it('should get all notification templates', async () => {
                Notification.getAllTemplates.mockResolvedValue([
                    {
                        id: 1,
                        name: 'template1',
                        type: 'info'
                    }
                ]);

                const res = await request(app)
                    .get('/api/notifications/admin/templates')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('name');
            });
        });

        describe('POST /api/notifications/admin/bulk', () => {
            it('should send bulk notifications when admin', async () => {
                const bulkData = {
                    template_name: 'test_template',
                    user_ids: [1, 2],
                    variables: { key: 'value' },
                    action_url: 'https://example.com'
                };

                const res = await request(app)
                    .post('/api/notifications/admin/bulk')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(bulkData);

                expect(res.status).toBe(201);
                expect(res.body).toMatchObject({
                    success: true,
                    sent_count: bulkData.user_ids.length,
                    failed_count: 0,
                    message: 'Bulk notification sent successfully'
                });
                expect(Notification.createBulkFromTemplate).toHaveBeenCalledWith(
                    bulkData.template_name,
                    bulkData.user_ids,
                    bulkData.variables,
                    bulkData.action_url
                );
            });
        });

        describe('POST /api/notifications/admin/broadcast', () => {
            it('should broadcast notification when admin', async () => {
                const broadcastData = {
                    template_name: 'test_template',
                    variables: { key: 'value' },
                    action_url: 'https://example.com'
                };

                const res = await request(app)
                    .post('/api/notifications/admin/broadcast')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(broadcastData);

                expect(res.status).toBe(201);
                expect(res.body).toMatchObject({
                    success: true,
                    sent_count: expect.any(Number),
                    message: 'Broadcast notification sent successfully'
                });
                expect(User.getUsersByStatus).toHaveBeenCalledWith('active');
                expect(Notification.createBulkFromTemplate).toHaveBeenCalledWith(
                    broadcastData.template_name,
                    [1, 2, 3, 4, 5], // Expected user IDs from mock
                    broadcastData.variables,
                    broadcastData.action_url
                );
            });
        });
    });
}); 