// Mock user profile data
export const mockProfileData = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    first_name: 'Jane',
    last_name: 'Doe',
    phone_number: '555-0123',
    profile_picture_url: 'https://i.pravatar.cc/300',
    email_notifications: true,
    sms_notifications: false,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    certificates: [
        {
            id: 1,
            class_id: 1,
            certificate_name: 'Watercolor Painting Basics',
            issue_date: '2024-03-10T10:00:00Z',
            certificate_url: 'https://example.com/certs/watercolor.pdf',
            class_name: 'Intro to Painting'
        },
        {
            id: 2,
            class_id: 2,
            certificate_name: 'Yoga Fundamentals',
            issue_date: '2024-03-12T10:00:00Z',
            certificate_url: 'https://example.com/certs/yoga.pdf',
            class_name: 'Yoga Basics'
        }
    ],
    payment_methods: [
        {
            id: 1,
            payment_type: 'credit_card',
            last_four: '4242',
            expiry_date: '2025-12-31',
            is_default: true
        }
    ],
    activity_log: [
        {
            id: 1,
            action: 'profile_update',
            details: { updated_fields: ['first_name', 'last_name'] },
            created_at: '2024-03-15T09:00:00Z'
        },
        {
            id: 2,
            action: 'enrollment',
            details: { class_id: 1, class_name: 'Intro to Painting' },
            created_at: '2024-03-14T15:00:00Z'
        },
        {
            id: 3,
            action: 'payment_method_added',
            details: { payment_type: 'credit_card', last_four: '4242' },
            created_at: '2024-03-13T11:00:00Z'
        }
    ],
    notifications: [
        {
            id: 1,
            type: 'class_reminder',
            title: 'Upcoming Class',
            message: 'Your painting class starts in 1 hour',
            is_read: false,
            action_url: '/classes/1',
            created_at: '2024-03-15T08:00:00Z'
        },
        {
            id: 2,
            type: 'certificate_ready',
            title: 'Certificate Available',
            message: 'Your yoga certificate is ready to download',
            is_read: false,
            action_url: '/certificates/2',
            created_at: '2024-03-14T16:00:00Z'
        },
        {
            id: 3,
            type: 'payment_due',
            title: 'Payment Reminder',
            message: 'Payment for Cooking with Spices is due soon',
            is_read: true,
            action_url: '/payments/3',
            created_at: '2024-03-13T10:00:00Z'
        }
    ]
}; 