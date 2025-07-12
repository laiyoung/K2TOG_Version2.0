// server/db/seed.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Clean up old data to prevent duplicates
    await pool.query('DELETE FROM enrollments');
    await pool.query('DELETE FROM class_sessions');
    await pool.query('DELETE FROM class_waitlist');
    await pool.query('DELETE FROM certificates');
    await pool.query('DELETE FROM payments');
    await pool.query('DELETE FROM classes');

    // Create test users only if they don't exist
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, role, status, first_name, last_name, phone_number, email_notifications)
      SELECT * FROM (
        VALUES
          ('Jane Doe', 'jane@example.com', $1, 'user', 'active', 'Jane', 'Doe', '555-0123', true),
          ('John Smith', 'john@example.com', $1, 'user', 'active', 'John', 'Smith', '555-0124', true),
          ('Admin User', 'admin@example.com', $2, 'admin', 'active', 'Admin', 'User', '555-0125', true),
          ('Instructor One', 'instructor1@example.com', $1, 'instructor', 'active', 'Instructor', 'One', '555-0126', true),
          ('Instructor Two', 'instructor2@example.com', $1, 'instructor', 'active', 'Instructor', 'Two', '555-0127', true)
      ) AS new_users(name, email, password, role, status, first_name, last_name, phone_number, email_notifications)
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = new_users.email
      )
    `, [userPassword, adminPassword]);

    // Get instructor IDs
    const { rows: instructorRows } = await pool.query(`
      SELECT id, email FROM users WHERE role = 'instructor'
    `);
    const instructorOneId = instructorRows.find(u => u.email === 'instructor1@example.com')?.id;
    const instructorTwoId = instructorRows.find(u => u.email === 'instructor2@example.com')?.id;

    if (!instructorOneId || !instructorTwoId) {
      console.error('Failed to find instructor IDs');
      return;
    }

    // Get student user IDs
    const { rows: studentRows } = await pool.query(`
      SELECT id, email FROM users WHERE email IN ('jane@example.com', 'john@example.com')
    `);
    const janeId = studentRows.find(u => u.email === 'jane@example.com')?.id;
    const johnId = studentRows.find(u => u.email === 'john@example.com')?.id;

    // Seed classes (general info only)
    const classes = [
      {
        title: 'Child Development Associate (CDA)',
        description: 'This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. This 2-month program runs Monday through Friday from 7:00 PM to 10:00 PM.',
        location_type: 'zoom',
        location_details: 'Online via Zoom',
        price: 299.99,
        recurrence_pattern: { 
          frequency: 'weekly', 
          interval: 1, 
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          endDate: '2025-07-31' // 2 months from start date
        },
        prerequisites: 'None required',
        materials_needed: 'Computer with internet access, webcam, and microphone',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-1_mlye6d.jpg'
      },
      {
        title: 'Development and Operations',
        description: 'Master the essential skills needed to run a successful childcare program. Choose between our 2-week evening program (Monday-Friday, 7:00 PM - 10:00 PM) or our 5-day Saturday intensive (9:00 AM - 3:00 PM).',
        location_type: 'in-person',
        location_details: 'Main Training Center, Room 101',
        price: 349.99,
        recurrence_pattern: { 
          frequency: 'weekly', 
          interval: 1, 
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          endDate: '2025-06-14' // 2 weeks from start date
        },
        prerequisites: 'Basic childcare experience recommended',
        materials_needed: 'Notebook, laptop (optional)',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-2_vpqyct.jpg'
      },
      {
        title: 'CPR and First Aid Certification',
        description: 'Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This one-day Saturday program runs from 9:00 AM to 2:00 PM.',
        location_type: 'in-person',
        location_details: 'Training Center, Room 203',
        price: 149.99,
        recurrence_pattern: null,
        prerequisites: 'None required',
        materials_needed: 'Comfortable clothing for practical exercises',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786180/class-3_fealxp.jpg'
      },

    ];

    // Insert classes
    for (const classData of classes) {
      await pool.query(`
        INSERT INTO classes (
          title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (title) DO NOTHING
      `, [
        classData.title,
        classData.description,
        classData.price,
        classData.location_type,
        classData.location_details,
        JSON.stringify(classData.recurrence_pattern || null),
        classData.prerequisites,
        classData.materials_needed,
        classData.image_url
      ]);
    }

    // Get class IDs for seeding related data
    const { rows: classRows } = await pool.query('SELECT id, title FROM classes');
    const classMap = new Map(classRows.map(c => [c.title, c.id]));

    // Use a Date object for reviewedAt (timestamptz) and a string for enrolledAt (timestamp)
    const reviewedAtTz = new Date('2025-06-18T00:38:08.603Z').toISOString(); // for timestamptz
    const enrolledAtTs = '2025-06-18 00:38:08'; // for timestamp
    const recentEnrolledAtTs = '2025-07-05 12:00:00'; // for recent pending enrollments (timestamp)
    const dueDateTz = new Date('2025-06-20T00:00:00.000Z').toISOString(); // for payments due_date (timestamptz)
    const refundedAtTz = new Date('2025-06-25T00:00:00.000Z').toISOString(); // for payments refunded_at (timestamptz)
    const paymentCreatedAtTs = '2025-06-18 00:38:08'; // for payments created_at (timestamp)

    // Seed class sessions with instructors
    await pool.query(`
      INSERT INTO class_sessions (
        class_id, 
        session_date, 
        end_date,
        start_time, 
        end_time, 
        capacity, 
        enrolled_count, 
        min_enrollment, 
        waitlist_enabled, 
        waitlist_capacity, 
        instructor_id, 
        status
      )
      VALUES
        -- Child Development Associate (CDA) sessions with Instructor One (multi-day sessions)
        -- Past sessions (completed)
        ($1, '2025-06-02', '2025-06-06', '19:00', '22:00', 20, 18, 5, true, 10, $2, 'completed'),
        ($1, '2025-06-09', '2025-06-13', '19:00', '22:00', 20, 15, 5, true, 10, $2, 'completed'),
        
        -- Current sessions (this week and next week)
        ($1, '2025-07-07', '2025-07-11', '19:00', '22:00', 20, 12, 5, true, 10, $2, 'scheduled'),
        ($1, '2025-07-14', '2025-07-18', '19:00', '22:00', 20, 8, 5, true, 10, $2, 'scheduled'),
        
        -- Future sessions (next month)
        ($1, '2025-08-04', '2025-08-08', '19:00', '22:00', 20, 5, 5, true, 10, $2, 'scheduled'),
        ($1, '2025-08-11', '2025-08-15', '19:00', '22:00', 20, 3, 5, true, 10, $2, 'scheduled'),
        
        -- Development and Operations sessions with Instructor Two (multi-day sessions)
        -- Past sessions (completed)
        ($3, '2025-06-03', '2025-06-07', '19:00', '22:00', 15, 12, 5, true, 5, $4, 'completed'),
        ($3, '2025-06-10', '2025-06-14', '19:00', '22:00', 15, 10, 5, true, 5, $4, 'completed'),
        
        -- Current sessions
        ($3, '2025-07-08', '2025-07-12', '19:00', '22:00', 15, 8, 5, true, 5, $4, 'scheduled'),
        ($3, '2025-07-15', '2025-07-19', '19:00', '22:00', 15, 6, 5, true, 5, $4, 'scheduled'),
        
        -- Future sessions
        ($3, '2025-08-05', '2025-08-09', '19:00', '22:00', 15, 4, 5, true, 5, $4, 'scheduled'),
        ($3, '2025-08-12', '2025-08-16', '19:00', '22:00', 15, 2, 5, true, 5, $4, 'scheduled'),
        
        -- CPR and First Aid Certification sessions with Instructor One (single-day sessions)
        -- Past sessions (completed)
        ($5, '2025-06-07', NULL, '09:00', '14:00', 12, 10, 4, true, 8, $2, 'completed'),
        ($5, '2025-06-14', NULL, '09:00', '14:00', 12, 8, 4, true, 8, $2, 'completed'),
        
        -- Current sessions
        ($5, '2025-07-12', NULL, '09:00', '14:00', 12, 6, 4, true, 8, $2, 'scheduled'),
        ($5, '2025-07-19', NULL, '09:00', '14:00', 12, 4, 4, true, 8, $2, 'scheduled'),
        
        -- Future sessions
        ($5, '2025-08-09', NULL, '09:00', '14:00', 12, 3, 4, true, 8, $2, 'scheduled'),
        ($5, '2025-08-16', NULL, '09:00', '14:00', 12, 1, 4, true, 8, $2, 'scheduled')
      ON CONFLICT DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      instructorOneId,
      classMap.get('Development and Operations'),
      instructorTwoId,
      classMap.get('CPR and First Aid Certification')
    ]);

    // Seed waitlist entries
    await pool.query(`
      INSERT INTO class_waitlist (class_id, user_id, position, status, created_at)
      VALUES
        -- Past session waitlist entries (completed)
        ($1, 2, 1, 'approved', $4),
        ($2, 1, 1, 'approved', $4),
        ($3, 2, 1, 'approved', $4),
        
        -- Current session waitlist entries
        ($1, 1, 1, 'pending', $4),
        ($2, 2, 1, 'pending', $4),
        ($3, 1, 1, 'rejected', $4),
        
        -- Future session waitlist entries
        ($1, 2, 1, 'pending', $4),
        ($3, 1, 1, 'pending', $4),
        ($3, 2, 2, 'approved', $4)
      ON CONFLICT (class_id, user_id) DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations'),
      classMap.get('CPR and First Aid Certification'),
      reviewedAtTz
    ]);

    // Get session IDs for enrollment seeding
    const { rows: enrollmentSessionRows } = await pool.query(`
      SELECT id, class_id, session_date, ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY session_date) as session_num
      FROM class_sessions 
      ORDER BY class_id, session_date
    `);

    // Create a map of sessions by class and session number
    const sessionMap = new Map();
    enrollmentSessionRows.forEach(session => {
      const key = `${session.class_id}-${session.session_num}`;
      sessionMap.set(key, session.id);
    });

    // Get sessions for different time periods
    // Past sessions (completed)
    const cdaPastSession = sessionMap.get(`${classMap.get('Child Development Associate (CDA)')}-1`);
    const devOpsPastSession = sessionMap.get(`${classMap.get('Development and Operations')}-1`);
    const cprPastSession = sessionMap.get(`${classMap.get('CPR and First Aid Certification')}-1`);

    // Current sessions (this week)
    const cdaCurrentSession = sessionMap.get(`${classMap.get('Child Development Associate (CDA)')}-3`);
    const devOpsCurrentSession = sessionMap.get(`${classMap.get('Development and Operations')}-3`);
    const cprCurrentSession = sessionMap.get(`${classMap.get('CPR and First Aid Certification')}-3`);

    // Future sessions (next month)
    const cdaFutureSession = sessionMap.get(`${classMap.get('Child Development Associate (CDA)')}-5`);
    const devOpsFutureSession = sessionMap.get(`${classMap.get('Development and Operations')}-5`);
    const cprFutureSession = sessionMap.get(`${classMap.get('CPR and First Aid Certification')}-5`);
    


    await pool.query(`
      INSERT INTO enrollments (user_id, class_id, session_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by, enrolled_at)
      VALUES
        -- Past session enrollments (completed)
        (${janeId}, $1, $4, 'paid', 'approved', 'Past session completed', $7, 3, $8),
        (${janeId}, $2, $5, 'paid', 'approved', 'Past session completed', $7, 3, $8),
        (${johnId}, $3, $6, 'paid', 'approved', 'Past session completed', $7, 3, $8),
        
        -- Current session enrollments
        (${janeId}, $1, $9, 'paid', 'approved', 'Current session enrollment', $7, 3, $8),
        (${johnId}, $2, $10, 'paid', 'approved', 'Current session enrollment', $7, 3, $8),
        (${johnId}, $3, $11, 'paid', 'pending', NULL, NULL::timestamptz, NULL, $8),
        (${janeId}, $3, $11, 'paid', 'rejected', 'Class capacity reached', $7, 3, $8),
        
        -- Future session enrollments
        (${janeId}, $1, $12, 'paid', 'approved', 'Future session enrollment', $7, 3, $8),
        (${johnId}, $2, $13, 'paid', 'approved', 'Future session enrollment', $7, 3, $8),
        (${johnId}, $3, $14, 'paid', 'pending', NULL, NULL::timestamptz, NULL, $8)
      ON CONFLICT DO NOTHING
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations'),
      classMap.get('CPR and First Aid Certification'),
      cdaPastSession,
      devOpsPastSession,
      cprPastSession,
      reviewedAtTz,
      enrolledAtTs,
      cdaCurrentSession,
      devOpsCurrentSession,
      cprCurrentSession,
      cdaFutureSession,
      devOpsFutureSession,
      cprFutureSession
    ]);

    // Then, update user roles for users with approved enrollments
    await pool.query(`
      UPDATE users u
      SET role = 'student'
      WHERE EXISTS (
        SELECT 1 
        FROM enrollments e 
        WHERE e.user_id = u.id 
        AND e.enrollment_status = 'approved'
      )
      AND u.role = 'user'  -- Only update users who are not already instructors or admins
    `);

    // Update enrollment counts in class_sessions based on approved enrollments
    await pool.query(`
      UPDATE class_sessions cs
      SET enrolled_count = (
        SELECT COUNT(*)
        FROM enrollments e
        WHERE e.session_id = cs.id
        AND e.enrollment_status = 'approved'
      )
    `);

    // Seed certificates
    await pool.query(`
      INSERT INTO certificates (
        user_id, 
        class_id, 
        certificate_name, 
        certificate_url, 
        verification_code,
        status,
        uploaded_by
      )
      VALUES
        (1, $1, 'CDA Certificate', 'https://example.com/certs/cda.pdf', 'CDA-2025-001', 'approved', 3),
        (1, $2, 'Development and Operations Certificate', 'https://example.com/certs/devops.pdf', 'DO-2025-001', 'approved', 3),
        (2, $3, 'CPR and First Aid Certificate', 'https://example.com/certs/cpr.pdf', 'CPR-2025-001', 'pending', 3)
      ON CONFLICT (verification_code) DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations'),
      classMap.get('CPR and First Aid Certification')
    ]);

    // Seed payments
    await pool.query(`
      INSERT INTO payments (
        user_id, 
        class_id, 
        stripe_payment_id, 
        amount, 
        currency, 
        status,
        due_date,
        payment_method,
        last_four,
        refund_status,
        refund_amount,
        refund_reason,
        refunded_at,
        refunded_by,
        created_at
      )
      VALUES
        (1, $1, 'stripe_payment_1', 299.99, 'USD', 'completed', $4, 'credit_card', '4242', NULL, NULL, NULL, NULL, NULL, $7),
        (1, $2, 'stripe_payment_2', 349.99, 'USD', 'completed', $5, 'credit_card', '4242', 'processed', 349.99, 'Student requested refund', $6, 3, $7),
        (2, $3, 'stripe_payment_3', 149.99, 'USD', 'completed', $8, 'credit_card', '5555', NULL, NULL, NULL, NULL, NULL, $7),
        (2, $1, 'stripe_payment_4', 299.99, 'USD', 'pending', $9, 'credit_card', '5555', NULL, NULL, NULL, NULL, NULL, $7),
        (1, $3, 'stripe_payment_5', 149.99, 'USD', 'completed', $10, 'credit_card', '4242', 'processed', 74.99, 'Partial refund due to cancellation', $6, 3, $7)
      ON CONFLICT (stripe_payment_id) DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'), // $1
      classMap.get('Development and Operations'),        // $2
      classMap.get('CPR and First Aid Certification'),   // $3
      dueDateTz,                                         // $4 - for row 1
      dueDateTz,                                         // $5 - for row 2
      refundedAtTz,                                      // $6
      paymentCreatedAtTs,                                // $7
      dueDateTz,                                         // $8 - for row 3
      dueDateTz,                                         // $9 - for row 4
      dueDateTz                                          // $10 - for row 5
    ]);

    // Seed notification templates
    await pool.query(`
      INSERT INTO notification_templates (name, type, title_template, message_template, metadata)
        VALUES
          (
            'class_reminder',
            'class_notification',
            'Upcoming Class: {{class_name}}',
            'Your class "{{class_name}}" starts in {{time_until}}. Please join at {{location}}.',
            '{"category": "class", "priority": "high"}'::jsonb
          ),
          (
            'enrollment_approved',
            'user_notification',
            'Enrollment Approved: {{class_name}}',
            'Your enrollment in "{{class_name}}" has been approved. The class starts on {{start_date}}.',
            '{"category": "enrollment", "priority": "medium"}'::jsonb
          ),
          (
            'payment_due',
            'user_notification',
            'Payment Due: {{class_name}}',
            'Payment of {{amount}} for "{{class_name}}" is due on {{due_date}}.',
            '{"category": "payment", "priority": "high"}'::jsonb
          ),
          (
            'certificate_ready',
            'user_notification',
            'Certificate Available: {{class_name}}',
            'Your certificate for "{{class_name}}" is now available for download.',
            '{"category": "certificate", "priority": "medium"}'::jsonb
        )
      ON CONFLICT (name) DO NOTHING;
    `);

    // Seed notifications
    await pool.query(`
      INSERT INTO user_notifications (user_id, type, title, message, is_read, action_url, sender_id, metadata)
      VALUES
        -- Past session notifications
        (1, 'certificate_ready', 'Certificate Available: CDA', 'Your CDA certificate from June session is ready to download', false, '/certificates/1', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
        (1, 'certificate_ready', 'Certificate Available: DevOps', 'Your Development and Operations certificate is ready to download', false, '/certificates/2', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
        (2, 'certificate_ready', 'Certificate Available: CPR', 'Your CPR and First Aid certificate is ready to download', false, '/certificates/3', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
        
        -- Current session notifications
        (1, 'class_reminder', 'Upcoming Class: CDA', 'Your CDA class starts in 1 hour', false, '/classes/1', NULL, '{"category": "class", "priority": "high"}'::jsonb),
        (2, 'payment_due', 'Payment Due', 'Payment for CPR class is due tomorrow', false, '/payments/3', 3, '{"category": "payment", "priority": "high"}'::jsonb),
        
        -- Future session notifications
        (1, 'class_reminder', 'Upcoming Class: CDA (Aug)', 'Your CDA class starts in 3 weeks', false, '/classes/1', NULL, '{"category": "class", "priority": "medium"}'::jsonb),
        (2, 'enrollment_approved', 'Enrollment Approved: DevOps', 'Your enrollment in Development and Operations has been approved', false, '/classes/2', 3, '{"category": "enrollment", "priority": "medium"}'::jsonb),
        (2, 'class_reminder', 'Upcoming Class: CPR (Aug)', 'Your CPR class starts in 4 weeks', false, '/classes/3', NULL, '{"category": "class", "priority": "medium"}'::jsonb)
      ON CONFLICT DO NOTHING;
    `);

    // Seed activity logs
    await pool.query(`
      INSERT INTO user_activity_log (user_id, action, details, created_at)
      VALUES
        (1, 'profile_update', '{"updated_fields": ["first_name", "last_name"]}'::jsonb, $1),
        (1, 'enrollment', '{"class_id": 1, "class_name": "CDA"}'::jsonb, $1),
        (2, 'payment', '{"amount": 149.99, "class_name": "CPR"}'::jsonb, $1)
      ON CONFLICT DO NOTHING;
    `, [reviewedAtTz]);

    // --- Seed historical sessions ---
    const { rows: sessionRows } = await pool.query('SELECT id, class_id, session_date, end_date, start_time, end_time, capacity, enrolled_count, instructor_id, status FROM class_sessions ORDER BY session_date ASC');
    // We'll use the first session of each class for historical data
    const historicalSessionIds = [];
    for (let i = 0; i < 3; i++) {
      const s = sessionRows[i];
      const { rows: histRows } = await pool.query(`
        INSERT INTO historical_sessions (
          original_session_id, class_id, session_date, end_date, start_time, end_time, capacity, enrolled_count, instructor_id, status, archived_at, archived_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        s.id, s.class_id, s.session_date, s.end_date, s.start_time, s.end_time, s.capacity, s.enrolled_count, s.instructor_id, 'completed',
        '2025-07-01T12:00:00.000Z', // archived_at
        i === 0 ? 'Completed successfully' : (i === 1 ? 'Completed successfully' : 'Enrollment rejected')
      ]);
      historicalSessionIds.push(histRows[0].id);
    }

    // --- Fetch Jane Doe's enrollments for original_enrollment_id mapping ---
    const { rows: janeEnrollmentRows } = await pool.query(`
      SELECT id, class_id, session_id FROM enrollments WHERE user_id = $1 ORDER BY id ASC
    `, [janeId]);

    // --- Seed historical enrollments for Jane Doe ---
    // Use the same order as above: CDA, DevOps, CPR
    const janeEnrollments = [
      { classTitle: 'Child Development Associate (CDA)', status: 'approved', reason: 'Completed successfully' },
      { classTitle: 'Development and Operations', status: 'approved', reason: 'Completed successfully' },
      { classTitle: 'CPR and First Aid Certification', status: 'rejected', reason: 'Enrollment rejected' }
    ];
    for (let i = 0; i < 3; i++) {
      const classId = classMap.get(janeEnrollments[i].classTitle);
      const sessionId = sessionRows[i].id;
      const histSessionId = historicalSessionIds[i];
      const originalEnrollmentId = janeEnrollmentRows.find(e => e.class_id === classId && e.session_id === sessionId)?.id;
      await pool.query(`
        INSERT INTO historical_enrollments (
          original_enrollment_id, user_id, class_id, session_id, historical_session_id,
          payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by, enrolled_at, archived_at, archived_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        originalEnrollmentId,
        janeId,
        classId,
        sessionId,
        histSessionId,
        'paid',
        janeEnrollments[i].status,
        janeEnrollments[i].reason,
        reviewedAtTz,
        3, // reviewed_by (admin)
        enrolledAtTs,
        '2025-07-01T12:00:00.000Z', // archived_at
        janeEnrollments[i].reason
      ]);
    }

    // --- Fetch John Smith's enrollments for original_enrollment_id mapping ---
    const { rows: johnEnrollmentRows } = await pool.query(`
      SELECT id, class_id, session_id FROM enrollments WHERE user_id = $1 ORDER BY id ASC
    `, [johnId]);

    // --- Seed historical enrollments for John Smith ---
    const johnEnrollments = [
      { classTitle: 'Child Development Associate (CDA)', status: 'approved', reason: 'Completed successfully' },
      { classTitle: 'Development and Operations', status: 'approved', reason: 'Completed successfully' },
      { classTitle: 'CPR and First Aid Certification', status: 'approved', reason: 'Completed successfully' }
    ];
    for (let i = 0; i < 3; i++) {
      const classId = classMap.get(johnEnrollments[i].classTitle);
      const sessionId = sessionRows[i].id;
      const histSessionId = historicalSessionIds[i];
      const originalEnrollmentId = johnEnrollmentRows.find(e => e.class_id === classId && e.session_id === sessionId)?.id;
      await pool.query(`
        INSERT INTO historical_enrollments (
          original_enrollment_id, user_id, class_id, session_id, historical_session_id,
          payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by, enrolled_at, archived_at, archived_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        originalEnrollmentId,
        johnId,
        classId,
        sessionId,
        histSessionId,
        'paid',
        johnEnrollments[i].status,
        johnEnrollments[i].reason,
        reviewedAtTz,
        3, // reviewed_by (admin)
        enrolledAtTs,
        '2025-07-01T12:00:00.000Z', // archived_at
        johnEnrollments[i].reason
      ]);
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    await pool.end();
  }
};

// Only run if this file is being run directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error in seed script:', err);
      process.exit(1);
    });
}

module.exports = seed;
