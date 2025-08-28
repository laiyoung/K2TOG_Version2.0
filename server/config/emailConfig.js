// Email service configuration
module.exports = {
    // Batch processing settings for broadcasts
    batchProcessing: {
        // Number of emails to process concurrently in each batch
        batchSize: process.env.EMAIL_BATCH_SIZE || 10,

        // Delay between batches in milliseconds to avoid overwhelming email service
        batchDelay: process.env.EMAIL_BATCH_DELAY || 100,

        // Maximum number of concurrent email operations
        maxConcurrent: process.env.EMAIL_MAX_CONCURRENT || 50,

        // Timeout for individual email operations in milliseconds
        emailTimeout: process.env.EMAIL_TIMEOUT || 30000,

        // Retry settings for failed emails
        retryAttempts: process.env.EMAIL_RETRY_ATTEMPTS || 3,
        retryDelay: process.env.EMAIL_RETRY_DELAY || 5000
    },

    // Rate limiting settings
    rateLimiting: {
        // Maximum emails per minute
        maxEmailsPerMinute: process.env.EMAIL_RATE_LIMIT_PER_MINUTE || 100,

        // Maximum emails per hour
        maxEmailsPerHour: process.env.EMAIL_RATE_LIMIT_PER_HOUR || 1000
    },

    // Email service provider settings
    provider: {
        // Service name (gmail, sendgrid, etc.)
        service: process.env.EMAIL_SERVICE || 'gmail',

        // Connection pool settings
        pool: process.env.EMAIL_POOL === 'true',
        maxConnections: process.env.EMAIL_MAX_CONNECTIONS || 5,

        // TLS settings
        secure: process.env.EMAIL_SECURE === 'true',
        ignoreTLS: process.env.EMAIL_IGNORE_TLS === 'true'
    },

    // Logging and monitoring
    logging: {
        // Enable detailed email logging
        verbose: process.env.EMAIL_VERBOSE_LOGGING === 'true',

        // Log email content (be careful with sensitive data)
        logContent: process.env.EMAIL_LOG_CONTENT === 'true',

        // Log performance metrics
        logPerformance: process.env.EMAIL_LOG_PERFORMANCE !== 'false'
    }
};
