import React, { useState, useEffect } from 'react';
import { mockData } from '../../mockData/adminDashboardData';

function EnrollmentManagement() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Simulate fetching enrollments
    const fetchEnrollments = () => {
        try {
            setLoading(true);
            // Simulate API delay
            setTimeout(() => {
                setEnrollments(mockData.enrollments);
                setError(null);
                setLoading(false);
            }, 500);
        } catch (err) {
            setError('Failed to fetch enrollments. Please try again later.');
            console.error('Error fetching enrollments:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const handleApprove = (id) => {
        try {
            // Simulate API delay
            setTimeout(() => {
                setEnrollments(enrollments.map(e =>
                    e.id === id ? { ...e, status: 'approved' } : e
                ));
            }, 300);
        } catch (err) {
            setError('Failed to approve enrollment. Please try again.');
            console.error('Error approving enrollment:', err);
        }
    };

    const handleReject = (id) => {
        try {
            // Simulate API delay
            setTimeout(() => {
                setEnrollments(enrollments.map(e =>
                    e.id === id ? { ...e, status: 'rejected' } : e
                ));
            }, 300);
        } catch (err) {
            setError('Failed to reject enrollment. Please try again.');
            console.error('Error rejecting enrollment:', err);
        }
    };

    const handleCancel = (id) => {
        if (!window.confirm('Are you sure you want to cancel this enrollment?')) return;

        try {
            // Simulate API delay
            setTimeout(() => {
                setEnrollments(enrollments.filter(e => e.id !== id));
            }, 300);
        } catch (err) {
            setError('Failed to cancel enrollment. Please try again.');
            console.error('Error canceling enrollment:', err);
        }
    };

    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDetailsModal(true);
    };

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSearch =
            e.user.toLowerCase().includes(search.toLowerCase()) ||
            e.class.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Enrollment Management</h2>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Search enrollments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-1 rounded"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-1 rounded"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEnrollments.map(enrollment => (
                            <tr key={enrollment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{enrollment.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{enrollment.class}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            enrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(enrollment.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleViewDetails(enrollment)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Details
                                    </button>
                                    {enrollment.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(enrollment.id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(enrollment.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleCancel(enrollment.id)}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showDetailsModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium">Enrollment Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">User</p>
                                <p className="mt-1">{selectedEnrollment.user}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Class</p>
                                <p className="mt-1">{selectedEnrollment.class}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className="mt-1">{selectedEnrollment.status}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="mt-1">{new Date(selectedEnrollment.date).toLocaleDateString()}</p>
                            </div>
                            {selectedEnrollment.notes && (
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Notes</p>
                                    <p className="mt-1">{selectedEnrollment.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnrollmentManagement; 