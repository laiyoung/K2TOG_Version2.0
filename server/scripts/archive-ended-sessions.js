const { archiveEndedSessionsAndEnrollments } = require('../models/classModel');

(async () => {
  try {
    const result = await archiveEndedSessionsAndEnrollments();
    console.log(`Archived ${result.archivedSessions} ended sessions and their enrollments.`);
    process.exit(0);
  } catch (err) {
    console.error('Error archiving ended sessions:', err);
    process.exit(1);
  }
})(); 