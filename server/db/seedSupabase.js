// server/db/seedSupabase.js

// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

const seedSupabase = async () => {
  try {
    console.log('Starting Supabase database seeding...');

    // Clean up old data to prevent duplicates
    await supabase.from('historical_enrollments').delete().neq('id', 0);
    await supabase.from('historical_sessions').delete().neq('id', 0);
    await supabase.from('user_activity_log').delete().neq('id', 0);
    await supabase.from('user_notifications').delete().neq('id', 0);
    await supabase.from('notification_templates').delete().neq('id', 0);
    await supabase.from('payments').delete().neq('id', 0);
    await supabase.from('certificates').delete().neq('id', 0);
    await supabase.from('enrollments').delete().neq('id', 0);
    await supabase.from('class_waitlist').delete().neq('id', 0);
    await supabase.from('class_sessions').delete().neq('id', 0);
    await supabase.from('classes').delete().neq('id', 0);
    
    // Delete specific test users
    const testEmails = [
      'jane@example.com',
      'john@example.com', 
      'admin@example.com',
      'instructor1@example.com',
      'instructor2@example.com',
      'admin@yjchildcare.com'
    ];
    
    for (const email of testEmails) {
      await supabase.from('users').delete().eq('email', email);
    }

    // Create test users with proper bcrypt hashes
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const users = [
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user',
        status: 'active',
        first_name: 'Jane',
        last_name: 'Doe',
        phone_number: '555-0123',
        email_notifications: true
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        status: 'active',
        first_name: 'John',
        last_name: 'Smith',
        phone_number: '555-0124',
        email_notifications: true
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        status: 'active',
        first_name: 'Admin',
        last_name: 'User',
        phone_number: '555-0125',
        email_notifications: true
      },
      {
        name: 'Instructor One',
        email: 'instructor1@example.com',
        password: userPassword,
        role: 'instructor',
        status: 'active',
        first_name: 'Instructor',
        last_name: 'One',
        phone_number: '555-0126',
        email_notifications: true
      },
      {
        name: 'Instructor Two',
        email: 'instructor2@example.com',
        password: userPassword,
        role: 'instructor',
        status: 'active',
        first_name: 'Instructor',
        last_name: 'Two',
        phone_number: '555-0127',
        email_notifications: true
      }
    ];

    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select();

    if (userError) {
      console.error('Error inserting users:', userError);
      return;
    }

    console.log('Users created successfully');

    // Get user IDs for reference
    const userMap = new Map();
    insertedUsers.forEach(user => {
      userMap.set(user.email, user.id);
    });

    const janeId = userMap.get('jane@example.com');
    const johnId = userMap.get('john@example.com');
    const adminId = userMap.get('admin@example.com');
    const instructorOneId = userMap.get('instructor1@example.com');
    const instructorTwoId = userMap.get('instructor2@example.com');

    // Seed classes
    const classes = [
      {
        title: 'Child Development Associate (CDA)',
        description: 'This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. This 2-month program runs Monday through Friday from 7:00 PM to 10:00 PM.',
        price: 299.99,
        location_type: 'zoom',
        location_details: 'Online via Zoom',
        recurrence_pattern: { 
          frequency: 'weekly', 
          interval: 1, 
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          endDate: '2025-07-31'
        },
        prerequisites: 'None required',
        materials_needed: 'Computer with internet access, webcam, and microphone',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-1_mlye6d.jpg'
      },
      {
        title: 'Development and Operations',
        description: 'Master the essential skills needed to run a successful childcare program. Choose between our 2-week evening program (Monday-Friday, 7:00 PM - 10:00 PM) or our 5-day Saturday intensive (9:00 AM - 3:00 PM).',
        price: 349.99,
        location_type: 'in-person',
        location_details: 'Main Training Center, Room 101',
        recurrence_pattern: { 
          frequency: 'weekly', 
          interval: 1, 
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          endDate: '2025-06-14'
        },
        prerequisites: 'Basic childcare experience recommended',
        materials_needed: 'Notebook, laptop (optional)',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-2_vpqyct.jpg'
      },
      {
        title: 'CPR and First Aid Certification',
        description: 'Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This one-day Saturday program runs from 9:00 AM to 2:00 PM.',
        price: 149.99,
        location_type: 'in-person',
        location_details: 'Training Center, Room 203',
        recurrence_pattern: null,
        prerequisites: 'None required',
        materials_needed: 'Comfortable clothing for practical exercises',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786180/class-3_fealxp.jpg'
      }
    ];

    const { data: insertedClasses, error: classError } = await supabase
      .from('classes')
      .insert(classes)
      .select();

    if (classError) {
      console.error('Error inserting classes:', classError);
      return;
    }

    console.log('Classes created successfully');

    // Create class map
    const classMap = new Map();
    insertedClasses.forEach(cls => {
      classMap.set(cls.title, cls.id);
    });

    const cdaClassId = classMap.get('Child Development Associate (CDA)');
    const devopsClassId = classMap.get('Development and Operations');
    const cprClassId = classMap.get('CPR and First Aid Certification');

    // Seed class sessions
    const sessions = [
      // Child Development Associate (CDA) sessions with Instructor One
      // Past sessions (completed)
      { class_id: cdaClassId, session_date: '2025-06-02', end_date: '2025-06-06', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 18, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 10, instructor_id: instructorOneId, status: 'completed' },
      { class_id: cdaClassId, session_date: '2025-06-09', end_date: '2025-06-13', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 15, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 10, instructor_id: instructorOneId, status: 'completed' },
      
      // Current sessions
      { class_id: cdaClassId, session_date: '2025-07-07', end_date: '2025-07-11', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 12, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 10, instructor_id: instructorOneId, status: 'scheduled' },
      { class_id: cdaClassId, session_date: '2025-07-14', end_date: '2025-07-18', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 8, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 10, instructor_id: instructorOneId, status: 'scheduled' },
      
      // Future sessions
      { class_id: cdaClassId, session_date: '2025-08-04', end_date: '2025-08-08', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 5, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 10, instructor_id: instructorOneId, status: 'scheduled' },
      { class_id: cdaClassId, session_date: '2025-08-11', end_date: '2025-08-15', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 3, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 10, instructor_id: instructorOneId, status: 'scheduled' },
      
      // Development and Operations sessions with Instructor Two
      // Past sessions (completed)
      { class_id: devopsClassId, session_date: '2025-06-03', end_date: '2025-06-07', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 12, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 5, instructor_id: instructorTwoId, status: 'completed' },
      { class_id: devopsClassId, session_date: '2025-06-10', end_date: '2025-06-14', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 10, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 5, instructor_id: instructorTwoId, status: 'completed' },
      
      // Current sessions
      { class_id: devopsClassId, session_date: '2025-07-08', end_date: '2025-07-12', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 8, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 5, instructor_id: instructorTwoId, status: 'scheduled' },
      { class_id: devopsClassId, session_date: '2025-07-15', end_date: '2025-07-19', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 6, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 5, instructor_id: instructorTwoId, status: 'scheduled' },
      
      // Future sessions
      { class_id: devopsClassId, session_date: '2025-08-05', end_date: '2025-08-09', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 4, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 5, instructor_id: instructorTwoId, status: 'scheduled' },
      { class_id: devopsClassId, session_date: '2025-08-12', end_date: '2025-08-16', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 2, min_enrollment: 5, waitlist_enabled: true, waitlist_capacity: 5, instructor_id: instructorTwoId, status: 'scheduled' },
      
      // CPR and First Aid Certification sessions with Instructor One
      // Past sessions (completed)
      { class_id: cprClassId, session_date: '2025-06-07', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 10, min_enrollment: 4, waitlist_enabled: true, waitlist_capacity: 8, instructor_id: instructorOneId, status: 'completed' },
      { class_id: cprClassId, session_date: '2025-06-14', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 8, min_enrollment: 4, waitlist_enabled: true, waitlist_capacity: 8, instructor_id: instructorOneId, status: 'completed' },
      
      // Current sessions
      { class_id: cprClassId, session_date: '2025-07-12', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 6, min_enrollment: 4, waitlist_enabled: true, waitlist_capacity: 8, instructor_id: instructorOneId, status: 'scheduled' },
      { class_id: cprClassId, session_date: '2025-07-19', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 4, min_enrollment: 4, waitlist_enabled: true, waitlist_capacity: 8, instructor_id: instructorOneId, status: 'scheduled' },
      
      // Future sessions
      { class_id: cprClassId, session_date: '2025-08-09', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 3, min_enrollment: 4, waitlist_enabled: true, waitlist_capacity: 8, instructor_id: instructorOneId, status: 'scheduled' },
      { class_id: cprClassId, session_date: '2025-08-16', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 1, min_enrollment: 4, waitlist_enabled: true, waitlist_capacity: 8, instructor_id: instructorOneId, status: 'scheduled' }
    ];

    const { data: insertedSessions, error: sessionError } = await supabase
      .from('class_sessions')
      .insert(sessions)
      .select();

    if (sessionError) {
      console.error('Error inserting sessions:', sessionError);
      return;
    }

    console.log('Sessions created successfully');

    // Create session map for enrollment seeding
    const sessionMap = new Map();
    insertedSessions.forEach((session, index) => {
      const key = `${session.class_id}-${Math.floor(index / 6) + 1}`;
      sessionMap.set(key, session.id);
    });

    // Get sessions for different time periods
    const cdaPastSession = sessionMap.get(`${cdaClassId}-1`);
    const devOpsPastSession = sessionMap.get(`${devopsClassId}-1`);
    const cprPastSession = sessionMap.get(`${cprClassId}-1`);
    const cdaCurrentSession = sessionMap.get(`${cdaClassId}-3`);
    const devOpsCurrentSession = sessionMap.get(`${devopsClassId}-3`);
    const cprCurrentSession = sessionMap.get(`${cprClassId}-3`);
    const cdaFutureSession = sessionMap.get(`${cdaClassId}-5`);
    const devOpsFutureSession = sessionMap.get(`${devopsClassId}-5`);
    const cprFutureSession = sessionMap.get(`${cprClassId}-5`);

    // Seed enrollments
    const enrollments = [
      // Past session enrollments (approved) - These will show certificates
      { user_id: janeId, class_id: cdaClassId, session_id: cdaPastSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Past session completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: janeId, class_id: devopsClassId, session_id: devOpsPastSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Past session completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: cprClassId, session_id: cprPastSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Past session completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      
      // Current session enrollments
      { user_id: janeId, class_id: cdaClassId, session_id: cdaCurrentSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Current session enrollment', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: devopsClassId, session_id: devOpsCurrentSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Current session enrollment', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: cprClassId, session_id: cprCurrentSession, payment_status: 'paid', enrollment_status: 'pending', admin_notes: null, reviewed_at: null, reviewed_by: null, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: janeId, class_id: cprClassId, session_id: cprCurrentSession, payment_status: 'paid', enrollment_status: 'rejected', admin_notes: 'Class capacity reached', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      
      // Future session enrollments
      { user_id: janeId, class_id: cdaClassId, session_id: cdaFutureSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Future session enrollment', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: devopsClassId, session_id: devOpsFutureSession, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Future session enrollment', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: cprClassId, session_id: cprFutureSession, payment_status: 'paid', enrollment_status: 'pending', admin_notes: null, reviewed_at: null, reviewed_by: null, enrolled_at: '2025-06-18 00:38:08' }
    ];

    const { data: insertedEnrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert(enrollments)
      .select();

    if (enrollmentError) {
      console.error('Error inserting enrollments:', enrollmentError);
      return;
    }

    console.log('Enrollments created successfully');

    // Update user roles for users with approved enrollments
    await supabase
      .from('users')
      .update({ role: 'student' })
      .in('id', [janeId, johnId])
      .eq('role', 'user');

    // Seed waitlist entries (simplified to avoid duplicates)
    const waitlistEntries = [
      { class_id: cdaClassId, user_id: johnId, position: 1, status: 'approved', created_at: '2025-06-18T00:38:08.603Z' },
      { class_id: devopsClassId, user_id: janeId, position: 1, status: 'approved', created_at: '2025-06-18T00:38:08.603Z' },
      { class_id: cprClassId, user_id: johnId, position: 1, status: 'approved', created_at: '2025-06-18T00:38:08.603Z' },
      { class_id: cdaClassId, user_id: janeId, position: 2, status: 'pending', created_at: '2025-06-18T00:38:08.603Z' },
      { class_id: devopsClassId, user_id: johnId, position: 2, status: 'pending', created_at: '2025-06-18T00:38:08.603Z' },
      { class_id: cprClassId, user_id: janeId, position: 2, status: 'rejected', created_at: '2025-06-18T00:38:08.603Z' }
    ];

    const { error: waitlistError } = await supabase
      .from('class_waitlist')
      .upsert(waitlistEntries, { onConflict: 'class_id,user_id' });

    if (waitlistError) {
      console.error('Error inserting waitlist entries:', waitlistError);
      return;
    }

    console.log('Waitlist entries created successfully');

    // Seed certificates with proper Supabase storage URLs
    const certificates = [
      { 
        user_id: janeId, 
        class_id: cdaClassId, 
        certificate_name: 'Child Development Associate (CDA) Certificate', 
        certificate_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/${janeId}/certificate_${janeId}_${Date.now()}.pdf`, 
        verification_code: 'CDA-2025-001', 
        status: 'approved', 
        uploaded_by: adminId,
        created_at: '2025-06-20T00:00:00.000Z'
      },
      { 
        user_id: janeId, 
        class_id: devopsClassId, 
        certificate_name: 'Development and Operations Certificate', 
        certificate_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/${janeId}/certificate_${janeId}_${Date.now() + 1}.pdf`, 
        verification_code: 'DO-2025-001', 
        status: 'approved', 
        uploaded_by: adminId,
        created_at: '2025-06-15T00:00:00.000Z'
      },
      { 
        user_id: johnId, 
        class_id: cprClassId, 
        certificate_name: 'CPR and First Aid Certification', 
        certificate_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/${johnId}/certificate_${johnId}_${Date.now() + 2}.pdf`, 
        verification_code: 'CPR-2025-001', 
        status: 'approved', 
        uploaded_by: adminId,
        created_at: '2025-06-10T00:00:00.000Z'
      }
    ];

    const { error: certificateError } = await supabase
      .from('certificates')
      .insert(certificates);

    if (certificateError) {
      console.error('Error inserting certificates:', certificateError);
      return;
    }

    console.log('Certificates created successfully');

    // Seed payments
    const payments = [
      { user_id: janeId, class_id: cdaClassId, stripe_payment_id: 'stripe_payment_1', amount: 299.99, currency: 'USD', status: 'completed', due_date: '2025-06-20T00:00:00.000Z', payment_method: 'credit_card', last_four: '4242', created_at: '2025-06-18 00:38:08' },
      { user_id: janeId, class_id: devopsClassId, stripe_payment_id: 'stripe_payment_2', amount: 349.99, currency: 'USD', status: 'completed', due_date: '2025-06-20T00:00:00.000Z', payment_method: 'credit_card', last_four: '4242', refund_status: 'processed', refund_amount: 349.99, refund_reason: 'Student requested refund', refunded_at: '2025-06-25T00:00:00.000Z', refunded_by: adminId, created_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: cprClassId, stripe_payment_id: 'stripe_payment_3', amount: 149.99, currency: 'USD', status: 'completed', due_date: '2025-06-20T00:00:00.000Z', payment_method: 'credit_card', last_four: '5555', created_at: '2025-06-18 00:38:08' },
      { user_id: johnId, class_id: cdaClassId, stripe_payment_id: 'stripe_payment_4', amount: 299.99, currency: 'USD', status: 'pending', due_date: '2025-06-20T00:00:00.000Z', payment_method: 'credit_card', last_four: '5555', created_at: '2025-06-18 00:38:08' },
      { user_id: janeId, class_id: cprClassId, stripe_payment_id: 'stripe_payment_5', amount: 149.99, currency: 'USD', status: 'completed', due_date: '2025-06-20T00:00:00.000Z', payment_method: 'credit_card', last_four: '4242', refund_status: 'processed', refund_amount: 74.99, refund_reason: 'Partial refund due to cancellation', refunded_at: '2025-06-25T00:00:00.000Z', refunded_by: adminId, created_at: '2025-06-18 00:38:08' }
    ];

    const { error: paymentError } = await supabase
      .from('payments')
      .insert(payments);

    if (paymentError) {
      console.error('Error inserting payments:', paymentError);
      return;
    }

    console.log('Payments created successfully');

    // Seed notification templates
    const notificationTemplates = [
      {
        name: 'class_reminder',
        type: 'class_notification',
        title_template: 'Upcoming Class: {{class_name}}',
        message_template: 'Your class "{{class_name}}" starts in {{time_until}}. Please join at {{location}}.',
        metadata: { category: 'class', priority: 'high' }
      },
      {
        name: 'enrollment_approved',
        type: 'user_notification',
        title_template: 'Enrollment Approved: {{class_name}}',
        message_template: 'Your enrollment in "{{class_name}}" has been approved. The class starts on {{start_date}}.',
        metadata: { category: 'enrollment', priority: 'medium' }
      },
      {
        name: 'payment_due',
        type: 'user_notification',
        title_template: 'Payment Due: {{class_name}}',
        message_template: 'Payment of {{amount}} for "{{class_name}}" is due on {{due_date}}.',
        metadata: { category: 'payment', priority: 'high' }
      },
      {
        name: 'certificate_ready',
        type: 'user_notification',
        title_template: 'Certificate Available: {{class_name}}',
        message_template: 'Your certificate for "{{class_name}}" is now available for download.',
        metadata: { category: 'certificate', priority: 'medium' }
      }
    ];

    const { error: templateError } = await supabase
      .from('notification_templates')
      .insert(notificationTemplates);

    if (templateError) {
      console.error('Error inserting notification templates:', templateError);
      return;
    }

    console.log('Notification templates created successfully');

    // Seed notifications
    const notifications = [
      // Past session notifications
      { user_id: janeId, type: 'certificate_ready', title: 'Certificate Available: CDA', message: 'Your CDA certificate from June session is ready to download', is_read: false, action_url: '/certificates/1', metadata: { category: 'certificate', priority: 'medium' } },
      { user_id: janeId, type: 'certificate_ready', title: 'Certificate Available: DevOps', message: 'Your Development and Operations certificate is ready to download', is_read: false, action_url: '/certificates/2', metadata: { category: 'certificate', priority: 'medium' } },
      { user_id: johnId, type: 'certificate_ready', title: 'Certificate Available: CPR', message: 'Your CPR and First Aid certificate is ready to download', is_read: false, action_url: '/certificates/3', metadata: { category: 'certificate', priority: 'medium' } },
      
      // Current session notifications
      { user_id: janeId, type: 'class_reminder', title: 'Upcoming Class: CDA', message: 'Your CDA class starts in 1 hour', is_read: false, action_url: '/classes/1', metadata: { category: 'class', priority: 'high' } },
      { user_id: johnId, type: 'payment_due', title: 'Payment Due', message: 'Payment for CPR class is due tomorrow', is_read: false, action_url: '/payments/3', sender_id: adminId, metadata: { category: 'payment', priority: 'high' } },
      
      // Future session notifications
      { user_id: janeId, type: 'class_reminder', title: 'Upcoming Class: CDA (Aug)', message: 'Your CDA class starts in 3 weeks', is_read: false, action_url: '/classes/1', metadata: { category: 'class', priority: 'medium' } },
      { user_id: johnId, type: 'enrollment_approved', title: 'Enrollment Approved: DevOps', message: 'Your enrollment in Development and Operations has been approved', is_read: false, action_url: '/classes/2', sender_id: adminId, metadata: { category: 'enrollment', priority: 'medium' } },
      { user_id: johnId, type: 'class_reminder', title: 'Upcoming Class: CPR (Aug)', message: 'Your CPR class starts in 4 weeks', is_read: false, action_url: '/classes/3', metadata: { category: 'class', priority: 'medium' } }
    ];

    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error inserting notifications:', notificationError);
      return;
    }

    console.log('Notifications created successfully');

    // Seed activity logs
    const activityLogs = [
      { user_id: janeId, action: 'profile_update', details: { updated_fields: ['first_name', 'last_name'] }, created_at: '2025-06-18T00:38:08.603Z' },
      { user_id: janeId, action: 'enrollment', details: { class_id: 1, class_name: 'CDA' }, created_at: '2025-06-18T00:38:08.603Z' },
      { user_id: johnId, action: 'payment', details: { amount: 149.99, class_name: 'CPR' }, created_at: '2025-06-18T00:38:08.603Z' }
    ];

    const { error: activityError } = await supabase
      .from('user_activity_log')
      .insert(activityLogs);

    if (activityError) {
      console.error('Error inserting activity logs:', activityError);
      return;
    }

    console.log('Activity logs created successfully');

    // Seed historical sessions
    const historicalSessions = [
      { original_session_id: cdaPastSession, class_id: cdaClassId, session_date: '2025-06-02', end_date: '2025-06-06', start_time: '19:00', end_time: '22:00', capacity: 20, enrolled_count: 18, instructor_id: instructorOneId, status: 'completed', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' },
      { original_session_id: devOpsPastSession, class_id: devopsClassId, session_date: '2025-06-03', end_date: '2025-06-07', start_time: '19:00', end_time: '22:00', capacity: 15, enrolled_count: 12, instructor_id: instructorTwoId, status: 'completed', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' },
      { original_session_id: cprPastSession, class_id: cprClassId, session_date: '2025-06-07', end_date: null, start_time: '09:00', end_time: '14:00', capacity: 12, enrolled_count: 10, instructor_id: instructorOneId, status: 'completed', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Enrollment rejected' }
    ];

    const { data: insertedHistoricalSessions, error: histSessionError } = await supabase
      .from('historical_sessions')
      .insert(historicalSessions)
      .select();

    if (histSessionError) {
      console.error('Error inserting historical sessions:', histSessionError);
      return;
    }

    console.log('Historical sessions created successfully');

    // Seed historical enrollments
    const historicalEnrollments = [
      // Jane Doe's historical enrollments
      { user_id: janeId, class_id: cdaClassId, session_id: cdaPastSession, historical_session_id: insertedHistoricalSessions[0].id, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' },
      { user_id: janeId, class_id: devopsClassId, session_id: devOpsPastSession, historical_session_id: insertedHistoricalSessions[1].id, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' },
      { user_id: janeId, class_id: cprClassId, session_id: cprPastSession, historical_session_id: insertedHistoricalSessions[2].id, payment_status: 'paid', enrollment_status: 'rejected', admin_notes: 'Enrollment rejected', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Enrollment rejected' },
      
      // John Smith's historical enrollments
      { user_id: johnId, class_id: cdaClassId, session_id: cdaPastSession, historical_session_id: insertedHistoricalSessions[0].id, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' },
      { user_id: johnId, class_id: devopsClassId, session_id: devOpsPastSession, historical_session_id: insertedHistoricalSessions[1].id, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' },
      { user_id: johnId, class_id: cprClassId, session_id: cprPastSession, historical_session_id: insertedHistoricalSessions[2].id, payment_status: 'paid', enrollment_status: 'approved', admin_notes: 'Completed successfully', reviewed_at: '2025-06-18T00:38:08.603Z', reviewed_by: adminId, enrolled_at: '2025-06-18 00:38:08', archived_at: '2025-07-01T12:00:00.000Z', archived_reason: 'Completed successfully' }
    ];

    const { error: histEnrollmentError } = await supabase
      .from('historical_enrollments')
      .insert(historicalEnrollments);

    if (histEnrollmentError) {
      console.error('Error inserting historical enrollments:', histEnrollmentError);
      return;
    }

    console.log('Historical enrollments created successfully');

    console.log('Supabase database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Regular Users:');
    console.log('  jane@example.com / user123');
    console.log('  john@example.com / user123');
    console.log('Admins:');
    console.log('  admin@example.com / admin123');
    console.log('  admin@yjchildcare.com / admin123');
    console.log('Instructors:');
    console.log('  instructor1@example.com / user123');
    console.log('  instructor2@example.com / user123');

  } catch (err) {
    console.error('Error seeding Supabase database:', err);
    throw err;
  }
};

// Only run if this file is being run directly
if (require.main === module) {
  seedSupabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error in Supabase seed script:', err);
      process.exit(1);
    });
}

module.exports = seedSupabase; 