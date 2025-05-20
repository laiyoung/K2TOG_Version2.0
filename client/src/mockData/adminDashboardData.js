// Mock data for admin dashboard components
export const mockData = {
    // Enrollment data
    enrollments: [
        {
            id: 1,
            user: 'John Doe',
            class: 'Preschool A',
            status: 'pending',
            date: '2024-03-15',
            notes: 'Parent requested morning session'
        },
        {
            id: 2,
            user: 'Jane Smith',
            class: 'Toddler B',
            status: 'approved',
            date: '2024-03-14',
            notes: 'Completed all requirements'
        },
        {
            id: 3,
            user: 'Mike Johnson',
            class: 'Kindergarten C',
            status: 'rejected',
            date: '2024-03-13',
            notes: 'Age requirement not met'
        }
    ],

    // Certificate data
    certificates: [
        {
            id: 1,
            certificate_name: "Art Fundamentals Certificate",
            student_name: "Jane Doe",
            student_id: "STU001",
            class_name: "Art Fundamentals",
            class_id: "ART101",
            upload_date: "2024-03-15",
            expiry_date: "2025-03-15",
            status: "active",
            file_url: "https://example.com/certificates/art-fundamentals-jane-doe.pdf",
            file_type: "pdf",
            file_size: "2.5MB",
            uploaded_by: "John Smith",
            verification_code: "ART-2024-001"
        },
        {
            id: 2,
            certificate_name: "Yoga Basics Certificate",
            student_name: "John Smith",
            student_id: "STU002",
            class_name: "Yoga Basics",
            class_id: "YOG101",
            upload_date: "2024-02-20",
            expiry_date: "2025-02-20",
            status: "active",
            file_url: "https://example.com/certificates/yoga-basics-john-smith.pdf",
            file_type: "pdf",
            file_size: "2.1MB",
            uploaded_by: "Sarah Johnson",
            verification_code: "YOG-2024-002"
        },
        {
            id: 3,
            certificate_name: "Music Theory Certificate",
            student_name: "Alice Brown",
            student_id: "STU003",
            class_name: "Music Theory",
            class_id: "MUS101",
            upload_date: "2023-12-10",
            expiry_date: "2024-12-10",
            status: "expired",
            file_url: "https://example.com/certificates/music-theory-alice-brown.pdf",
            file_type: "pdf",
            file_size: "1.8MB",
            uploaded_by: "Michael Chen",
            verification_code: "MUS-2023-003"
        },
        {
            id: 4,
            certificate_name: "Dance Fundamentals Certificate",
            student_name: "Bob Wilson",
            student_id: "STU004",
            class_name: "Dance Fundamentals",
            class_id: "DAN101",
            upload_date: "2024-01-05",
            expiry_date: "2025-01-05",
            status: "revoked",
            file_url: "https://example.com/certificates/dance-fundamentals-bob-wilson.pdf",
            file_type: "pdf",
            file_size: "2.3MB",
            uploaded_by: "Emily Davis",
            verification_code: "DAN-2024-004",
            revocation_reason: "Incomplete course requirements"
        },
        {
            id: 5,
            certificate_name: "Coding Basics Certificate",
            student_name: "Carol Martinez",
            student_id: "STU005",
            class_name: "Coding Basics",
            class_id: "COD101",
            upload_date: "2024-03-01",
            expiry_date: "2025-03-01",
            status: "active",
            file_url: "https://example.com/certificates/coding-basics-carol-martinez.pdf",
            file_type: "pdf",
            file_size: "2.0MB",
            uploaded_by: "David Lee",
            verification_code: "COD-2024-005"
        }
    ],
    users: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Mike Johnson' }
    ],
    classes: [
        { id: 1, title: 'Preschool A' },
        { id: 2, title: 'Toddler B' },
        { id: 3, title: 'Kindergarten C' }
    ],

    // Analytics data
    analytics: {
        summary: {
            totalRevenue: 125000,
            revenueGrowth: 15,
            activeEnrollments: 45,
            enrollmentGrowth: 8,
            totalUsers: 120,
            newUsersThisMonth: 12,
            activeClasses: 8,
            classGrowth: 5
        },
        revenue: {
            monthly: [
                { month: 'Jan', amount: 10000 },
                { month: 'Feb', amount: 12000 },
                { month: 'Mar', amount: 15000 }
            ],
            byClass: [
                { name: 'Preschool A', revenue: 25000 },
                { name: 'Toddler B', revenue: 20000 },
                { name: 'Kindergarten C', revenue: 30000 }
            ]
        },
        enrollments: {
            trends: [
                { month: 'Jan', count: 30 },
                { month: 'Feb', count: 35 },
                { month: 'Mar', count: 45 }
            ],
            topClasses: [
                { name: 'Preschool A', enrollments: 15 },
                { name: 'Toddler B', enrollments: 12 },
                { name: 'Kindergarten C', enrollments: 10 }
            ]
        },
        userEngagement: {
            activeUsers: 80,
            inactiveUsers: 30,
            newUsers: 10
        },
        userActivity: {
            activeSessions: 25,
            newRegistrations: 8,
            completedClasses: 15,
            recentActivity: [
                {
                    type: 'success',
                    message: 'New enrollment approved',
                    timestamp: '2024-03-15T10:30:00'
                },
                {
                    type: 'warning',
                    message: 'Class capacity near limit',
                    timestamp: '2024-03-15T09:15:00'
                },
                {
                    type: 'error',
                    message: 'Payment failed for enrollment #123',
                    timestamp: '2024-03-14T16:45:00'
                }
            ]
        }
    },
    notifications: [
        {
            id: 1,
            title: "Class Reminder",
            message: "Your Art Fundamentals class starts in 30 minutes!",
            read: false,
            timestamp: "2024-03-15T10:30:00",
            type: "reminder",
            user: "Jane Doe"
        },
        {
            id: 2,
            title: "Payment Received",
            message: "Thank you for your payment of $150.00 for Yoga Basics class.",
            read: true,
            timestamp: "2024-03-14T15:45:00",
            type: "payment",
            user: "John Smith"
        },
        {
            id: 3,
            title: "Certificate Ready",
            message: "Your Music Theory certificate is ready for download.",
            read: false,
            timestamp: "2024-03-13T09:20:00",
            type: "certificate",
            user: "Alice Brown"
        },
        {
            id: 4,
            title: "System Maintenance",
            message: "The system will be down for maintenance on March 20th from 2-4 AM.",
            read: false,
            timestamp: "2024-03-12T14:00:00",
            type: "system",
            user: "All Users"
        }
    ],
    notificationTemplates: [
        // Class Reminder Templates
        {
            id: 1,
            name: "Class Reminder",
            content: "Dear {student_name}, your {class_name} class starts in {time} minutes!",
            variables: ["student_name", "class_name", "time"],
            type: "reminder",
            recipientType: "user"
        },
        {
            id: 2,
            name: "Class Reminder",
            content: "Your {class_name} class starts in {time} minutes!",
            variables: ["class_name", "time"],
            type: "reminder",
            recipientType: "class"
        },
        // Payment Due Templates
        {
            id: 3,
            name: "Payment Due",
            content: "Dear {student_name}, your payment of ${amount} for {class_name} is due in {days} days.",
            variables: ["student_name", "amount", "class_name", "days"],
            type: "payment",
            recipientType: "user"
        },
        {
            id: 4,
            name: "Payment Due",
            content: "Your payment of ${amount} for {class_name} is due in {days} days.",
            variables: ["amount", "class_name", "days"],
            type: "payment",
            recipientType: "class"
        },
        // Certificate Ready Templates
        {
            id: 5,
            name: "Certificate Ready",
            content: "Dear {student_name}, your {certificate_name} certificate is ready for download.",
            variables: ["student_name", "certificate_name"],
            type: "certificate",
            recipientType: "user"
        },
        {
            id: 6,
            name: "Certificate Ready",
            content: "Your {certificate_name} certificate is ready for download.",
            variables: ["certificate_name"],
            type: "certificate",
            recipientType: "class"
        },
        // Welcome Message Templates
        {
            id: 7,
            name: "Welcome Message",
            content: "Welcome {student_name} to {class_name}! We're excited to have you join us.",
            variables: ["student_name", "class_name"],
            type: "welcome",
            recipientType: "user"
        },
        {
            id: 8,
            name: "Welcome Message",
            content: "Welcome to {class_name}! We're excited to have you join us.",
            variables: ["class_name"],
            type: "welcome",
            recipientType: "class"
        }
    ]
}; 