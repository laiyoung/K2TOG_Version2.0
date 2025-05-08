// Mock email service that silently succeeds or fails based on test needs
const mockSendEmail = jest.fn().mockImplementation(async ({ to, subject, html }) => {
  // In test environment, we don't need to log anything
  return true;
});

// Helper to simulate email failure in specific tests
mockSendEmail.mockRejectedValueOnce = () => {
  mockSendEmail.mockImplementationOnce(async () => {
    // Silently fail without logging
    throw new Error('Email failed');
  });
};

module.exports = mockSendEmail; 