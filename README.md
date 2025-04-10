# yjchildcareplus
Enroll in Early Childhood Education courses for child care providers.

1. Homepage
Featured Classes

Search & Filter (Category, Location, Price, Format)

Testimonials / Reviews

Call-to-action (Sign up, Browse Classes)

2. User Authentication
Sign Up

Login / Logout

Password Reset

3. User Dashboard (Student Panel)
Profile

Edit Info

Payment Methods

Notification Settings

My Classes

Upcoming Classes

View Details

Join Zoom (if virtual)

Location Details (if in-person)

Cancel Enrollment

Past Classes

View Materials / Recordings (if available)

Rate & Review

Enrollment History

Payment Receipts

Class Status

4. Classes
Browse Classes

Filter by Type (Zoom / In-Person)

Filter by Date, Instructor, Price, Location

Class Details Page (Date, Time, Instructor, Format, Cost)

Enroll & Pay Button

5. Payment System
Secure Checkout

Coupons / Discounts (optional)

Payment Confirmation Email

6. Notifications
Email Reminders

Before Class Starts (e.g., 24hr & 1hr notice)

Cancellation Confirmations

Payment Receipts

Upcoming Class Summary (weekly digest)

7. Admin Panel (Optional)
Manage Users

Add/Edit/Delete Classes

View Enrollment Stats

Send Bulk Notifications



File Structure: 
yj-child-care-plus/
│
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── assets/         # Images, icons, logos
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level views (Home, Login, Dashboard, etc.)
│       ├── services/       # API service functions
│       ├── context/        # React Context for auth, user state
│       ├── App.js
│       └── index.js
│
├── server/                  # Express + Node backend
│   ├── config/              # DB config, Stripe setup
│   │   ├── db.js            # PostgreSQL connection
│   │   └── stripe.js        # Stripe setup
│   ├── controllers/         # Request logic (classController.js, userController.js, etc.)
│   ├── models/              # DB queries and models (can use pg or an ORM like Sequelize)
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, error handling, etc.
│   ├── utils/               # Helper functions (e.g., sendEmail.js)
│   ├── jobs/                # Scheduled tasks (e.g., email reminders with node-cron)
│   ├── .env                 # Environment variables (PORT, DB_URL, etc.)
│   └── index.js             # Main server file
│
├── db/                      # SQL migration scripts or seed data
│   ├── schema.sql
│   └── seed.sql
│
├── package.json             # Root dependencies (can manage both client & server here)
├── README.md


Fold Structure: server/models/ :

server/
└── models/
    ├── index.js               # Central export for all models
    ├── userModel.js           # User-related DB queries
    ├── classModel.js          # Class-related DB queries
    ├── enrollmentModel.js     # Enrollment-related DB queries
    └── paymentModel.js        # Stripe/transaction records (optional)

🧠 What Each File Does
🔹 userModel.js
Handles:

Create/register user

Find user by email or ID

List all users (admin-only)

🔹 classModel.js
Handles:

Get all classes

Get class by ID

Create/update class (if needed)

Track enrollment count

🔹 enrollmentModel.js
Handles:

Enroll user in class

Cancel enrollment

Get enrolled classes by user

Check if user is already enrolled

🔹 paymentModel.js (Optional but useful for logging Stripe transactions)
Handles:

Save payment records

Lookup payment by user/class

🔹 index.js
