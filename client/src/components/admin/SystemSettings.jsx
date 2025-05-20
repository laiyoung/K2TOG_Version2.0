import React from 'react';
import mockData from '../../mock/adminDashboardData.json';

function SystemSettings() {
    const settings = mockData.systemSettings || {};
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">System Settings (Mock Data)</h2>
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium mb-2">Security</h3>
                <p>Password Policy: {settings.security?.passwordPolicy || 'N/A'}</p>
                <p>2FA Enabled: {settings.security? .2faEnabled? 'Yes' : 'No'}</p>
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