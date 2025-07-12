import React, { useState, useEffect } from 'react';

function SystemSettings() {
    const [settings, setSettings] = useState({
        security: {
            passwordPolicy: 'Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number',
            twoFactorEnabled: false
        },
        apiKeys: [],
        integrations: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSystemSettings();
    }, []);

    const fetchSystemSettings = async () => {
        try {
            setLoading(true);
            // TODO: Implement real system settings API call
            // const response = await adminService.getSystemSettings();
            // setSettings(response);

            // For now, using placeholder data
            setSettings({
                security: {
                    passwordPolicy: 'Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number',
                    twoFactorEnabled: false
                },
                apiKeys: [
                    { id: 1, name: 'Stripe API', status: 'Active' },
                    { id: 2, name: 'Email Service', status: 'Active' }
                ],
                integrations: [
                    { id: 1, name: 'Payment Gateway', status: 'Connected' },
                    { id: 2, name: 'Email Provider', status: 'Connected' }
                ]
            });
        } catch (err) {
            setError('Failed to load system settings');
            console.error('Error fetching system settings:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-medium">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium mb-2">Security</h3>
                <p>Password Policy: {settings.security?.passwordPolicy || 'N/A'}</p>
                <p>2FA Enabled: {settings.security?.twoFactorEnabled ? 'Yes' : 'No'}</p>
                <h3 className="font-medium mt-4 mb-2">API Keys</h3>
                <ul>
                    {(settings.apiKeys || []).map(key => (
                        <li key={key.id}>{key.name} - {key.status}</li>
                    ))}
                </ul>
                <h3 className="font-medium mt-4 mb-2">Integrations</h3>
                <ul>
                    {(settings.integrations || []).map(integration => (
                        <li key={integration.id}>{integration.name} - {integration.status}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SystemSettings; 