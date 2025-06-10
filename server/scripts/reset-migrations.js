const pool = require('../config/db');

async function resetMigrations() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        // Drop all tables in the correct order (respecting foreign key constraints)
        await client.query(`
            DROP TABLE IF EXISTS 
                certificates,
                payments,
                enrollments,
                class_waitlist,
                class_sessions,
                classes,
                user_notifications,
                notification_templates,
                user_activity_log,
                users,
                migrations
            CASCADE;
        `);

        // Commit transaction
        await client.query('COMMIT');
        console.log('Database reset successfully');

    } catch (err) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error resetting database:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// Only run if this file is being run directly
if (require.main === module) {
    resetMigrations()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error in reset script:', err);
            process.exit(1);
        });
}

module.exports = resetMigrations; 