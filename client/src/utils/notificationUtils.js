import { useSnackbar } from 'notistack';

/**
 * Shows a success notification using notistack
 * @param {Object} enqueueSnackbar - The enqueueSnackbar function from useSnackbar hook
 * @param {string} message - The message to display
 * @param {Object} options - Additional options for the notification
 */
export const showSuccessNotification = (enqueueSnackbar, message, options = {}) => {
    console.log('Showing success notification:', message); // Add debugging
    enqueueSnackbar(message, {
        variant: 'success',
        autoHideDuration: 5000,
        style: {
            zIndex: 1450,
            position: 'relative',
            pointerEvents: 'auto'
        },
        ...options
    });
};

/**
 * Shows an error notification using notistack
 * @param {Object} enqueueSnackbar - The enqueueSnackbar function from useSnackbar hook
 * @param {string} message - The message to display
 * @param {Object} options - Additional options for the notification
 */
export const showErrorNotification = (enqueueSnackbar, message, options = {}) => {
    console.log('Showing error notification:', message); // Add debugging
    enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: 6000,
        style: {
            zIndex: 1000, // Lower z-index for errors to prevent blocking navigation
            position: 'relative',
            pointerEvents: 'auto'
        },
        ...options
    });
};

/**
 * Custom hook that provides notification functions
 * @returns {Object} Object containing notification functions
 */
export const useNotifications = () => {
    const { enqueueSnackbar } = useSnackbar();

    return {
        showSuccess: (message, options) => showSuccessNotification(enqueueSnackbar, message, options),
        showError: (message, options) => showErrorNotification(enqueueSnackbar, message, options)
    };
}; 