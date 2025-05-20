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
    ],
    enrollments: [
        {
            id: 1,
            class_id: 1,
            class_name: 'Intro to Painting',
            teacher_name: 'Ms. Smith',
            schedule: 'Mon, Wed 3:00 PM - 4:30 PM',
            start_date: '2024-03-20',
            end_date: '2024-06-20',
            status: 'accepted',
            enrollment_date: '2024-03-15T10:00:00Z',
            last_updated: '2024-03-15T10:00:00Z',
            class_description: 'Learn the basics of watercolor and acrylic painting techniques',
            location: 'Art Studio 101',
            capacity: 12,
            current_students: 8
        },
        {
            id: 2,
            class_id: 2,
            class_name: 'Yoga Basics',
            teacher_name: 'Mr. Johnson',
            schedule: 'Tue, Thu 4:00 PM - 5:00 PM',
            start_date: '2024-04-01',
            end_date: '2024-06-30',
            status: 'pending',
            enrollment_date: '2024-03-16T14:30:00Z',
            last_updated: '2024-03-16T14:30:00Z',
            class_description: 'Introduction to yoga poses and breathing techniques',
            location: 'Yoga Studio',
            capacity: 15,
            current_students: 12
        },
        {
            id: 3,
            class_id: 3,
            class_name: 'Cooking with Spices',
            teacher_name: 'Chef Maria',
            schedule: 'Sat 10:00 AM - 12:00 PM',
            start_date: '2024-04-06',
            end_date: '2024-07-06',
            status: 'declined',
            enrollment_date: '2024-03-14T09:15:00Z',
            last_updated: '2024-03-14T09:15:00Z',
            decline_reason: 'Schedule conflict',
            class_description: 'Learn to cook with various spices and herbs',
            location: 'Culinary Lab',
            capacity: 10,
            current_students: 6
        },
        {
            id: 4,
            class_id: 4,
            class_name: 'Digital Art Fundamentals',
            teacher_name: 'Prof. Chen',
            schedule: 'Mon, Fri 2:00 PM - 3:30 PM',
            start_date: '2024-04-15',
            end_date: '2024-07-15',
            status: 'accepted',
            enrollment_date: '2024-03-17T11:20:00Z',
            last_updated: '2024-03-17T11:20:00Z',
            class_description: 'Introduction to digital art and design using tablets',
            location: 'Digital Arts Lab',
            capacity: 8,
            current_students: 5
        },
        {
            id: 5,
            class_id: 5,
            class_name: 'Music Theory',
            teacher_name: 'Dr. Williams',
            schedule: 'Wed 4:00 PM - 5:30 PM',
            start_date: '2024-04-10',
            end_date: '2024-07-10',
            status: 'pending',
            enrollment_date: '2024-03-18T15:45:00Z',
            last_updated: '2024-03-18T15:45:00Z',
            class_description: 'Learn the fundamentals of music theory and composition',
            location: 'Music Room 3',
            capacity: 12,
            current_students: 9
        },
        {
            id: 6,
            class_id: 6,
            class_name: 'Advanced Pottery',
            teacher_name: 'Ms. Rodriguez',
            schedule: 'Thu 3:00 PM - 5:00 PM',
            start_date: '2024-04-05',
            end_date: '2024-07-05',
            status: 'accepted',
            enrollment_date: '2024-03-19T09:30:00Z',
            last_updated: '2024-03-19T09:30:00Z',
            class_description: 'Advanced techniques in pottery and ceramic art',
            location: 'Pottery Studio',
            capacity: 6,
            current_students: 4
        },
        {
            id: 7,
            class_id: 7,
            class_name: 'Creative Writing',
            teacher_name: 'Prof. Thompson',
            schedule: 'Tue 5:00 PM - 6:30 PM',
            start_date: '2024-04-12',
            end_date: '2024-07-12',
            status: 'declined',
            enrollment_date: '2024-03-20T13:15:00Z',
            last_updated: '2024-03-20T13:15:00Z',
            decline_reason: 'Class time conflicts with other activities',
            class_description: 'Explore creative writing techniques and storytelling',
            location: 'Library Room 2',
            capacity: 15,
            current_students: 10
        }
    ],
    payments: [
        {
            id: 1,
            class_id: 1,
            class_name: 'Intro to Painting',
            amount: 299.99,
            due_date: '2024-04-01',
            status: 'due_soon',
            payment_method: 'credit_card',
            last_four: '4242'
        },
        {
            id: 2,
            class_id: 4,
            class_name: 'Digital Art Fundamentals',
            amount: 349.99,
            due_date: '2024-03-25',
            status: 'overdue',
            payment_method: 'credit_card',
            last_four: '4242'
        },
        {
            id: 3,
            class_id: 6,
            class_name: 'Advanced Pottery',
            amount: 399.99,
            due_date: '2024-04-15',
            status: 'paid',
            payment_method: 'credit_card',
            last_four: '4242',
            paid_date: '2024-03-20'
        }
    ]
}; 