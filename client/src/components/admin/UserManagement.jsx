import React, { useState } from 'react';
import mockData from '../../mock/adminDashboardData.json';

function UserManagement() {
    const [users, setUsers] = useState(mockData.users || []);
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [activityUser, setActivityUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordUser, setPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (user) => {
        setEditUser(user);
        setEditForm({ ...user });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSave = () => {
        setUsers(users.map(u => u.id === editUser.id ? { ...editForm, id: editUser.id } : u));
        setEditUser(null);
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    const handleViewActivity = (user) => {
        setActivityUser(user);
    };

    const handleChangePassword = (user) => {
        setPasswordUser(user);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    const handlePasswordSave = () => {
        // Mock: just close modal
        setShowPasswordModal(false);
        setPasswordUser(null);
        setNewPassword('');
        alert('Password changed (mock)');
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">User Management (Mock Data)</h2>
            <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-2 border px-2 py-1 rounded"
            />
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Role</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border-b">{user.name}</td>
                            <td className="py-2 px-4 border-b">{user.email}</td>
                            <td className="py-2 px-4 border-b">{user.role}</td>
                            <td className="py-2 px-4 border-b">{user.status}</td>
                            <td className="py-2 px-4 border-b">
                                <button className="text-blue-600 mr-2" onClick={() => handleEdit(user)}>Edit</button>
                                <button className="text-green-600 mr-2" onClick={() => handleViewActivity(user)}>View Activity</button>
                                <button className="text-yellow-600 mr-2" onClick={() => handleChangePassword(user)}>Change Password</button>
                                <button className="text-red-600" onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {editUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Edit User</h3>
                        <div className="space-y-2">
                            <input
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                className="w-full border px-2 py-1 rounded"
                                placeholder="Name"
                            />
                            <input
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                className="w-full border px-2 py-1 rounded"
                                placeholder="Email"
                            />
                            <select
                                name="role"
                                value={editForm.role}
                                onChange={handleEditChange}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select
                                name="status"
                                value={editForm.status}
                                onChange={handleEditChange}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button className="px-4 py-2 border rounded" onClick={() => setEditUser(null)}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleEditSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            {activityUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Activity for {activityUser.name}</h3>
                        <ul className="mb-4">
                            {mockData.userActivity.filter(a => a.userId === activityUser.id).map((a, idx) => (
                                <li key={idx} className="mb-1 text-sm">
                                    {a.action} <span className="text-gray-400">({new Date(a.timestamp).toLocaleString()})</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 border rounded" onClick={() => setActivityUser(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {showPasswordModal && passwordUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Change Password for {passwordUser.name}</h3>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full border px-2 py-1 rounded mb-4"
                            placeholder="New Password"
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 border rounded" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePasswordSave} disabled={!newPassword}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement; 