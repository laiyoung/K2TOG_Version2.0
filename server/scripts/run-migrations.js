const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        // Create migrations table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get list of migration files
        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        // Get list of executed migrations
        const { rows: executedMigrations } = await client.query(
            'SELECT name FROM migrations'
        );
        const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

        // Run each migration that hasn't been executed
        for (const file of migrationFiles) {
            if (!executedMigrationNames.has(file)) {
                console.log(`Running migration: ${file}`);
                const migrationPath = path.join(migrationsDir, file);
                const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
                
                await client.query(migrationSQL);
                await client.query(
                    'INSERT INTO migrations (name) VALUES ($1)',
                    [file]
                );
                console.log(`Completed migration: ${file}`);
            }
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('All migrations completed successfully');

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run migrations
runMigrations()
    .then(() => {
        console.log('Migrations completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    }); 