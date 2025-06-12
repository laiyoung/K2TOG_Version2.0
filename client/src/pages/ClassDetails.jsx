import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';
import classService from '../services/classService';
import enrollmentService from '../services/enrollmentService';
import { useNotifications } from '../utils/notificationUtils';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';

// Utility functions
const getDaysInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return eachDayOfInterval({ start, end });
};

const formatDate = (date) => {
    if (!date) return '';
    return format(parseISO(date), 'MMMM d, yyyy');
};

// Helper function to format time to user-friendly format
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

function ClassDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, initialized } = useAuth();
    const { showSuccess, showError } = useNotifications();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [waitlistStatus, setWaitlistStatus] = useState(null);
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [userEnrollments, setUserEnrollments] = useState([]);
    const [userWaitlist, setUserWaitlist] = useState([]);
    const isAdminOrInstructor = user && (user.role === 'admin' || user.role === 'instructor');
    const [roleEnrollError, setRoleEnrollError] = useState('');

    // Memoize the class data fetching effect
    useEffect(() => {
        const fetchClassDetails = async () => {
            if (!initialized) return; // Don't fetch until auth is initialized

            setLoading(true);
            setError(null);
            try {
                const data = await classService.getClassById(id);
                setClassData(data);

                // Only check enrollment and waitlist status if user is logged in
                if (user) {
                    try {
                        const enrollments = await enrollmentService.getUserEnrollments();
                        const isUserEnrolled = enrollments.some(enrollment => enrollment.class_id === id);
                        setIsEnrolled(isUserEnrolled);
                        setUserEnrollments(enrollments);
                        // Only check waitlist status if class is full
                        if (data.enrolled_count >= data.capacity) {
                            const waitlistData = await enrollmentService.getWaitlistStatus(id).catch(err => {
                                if (err.response?.status === 404) {
                                    // Not on waitlist is not an error, just return null
                                    return null;
                                }
                                throw err;
                            });
                            setWaitlistStatus(waitlistData);
                            setUserWaitlist(waitlistData);
                        } else {
                            setWaitlistStatus(null);
                            setUserWaitlist(null);
                        }
                    } catch (err) {
                        // Only log if not a 404 from waitlist or error message is not 'Not on waitlist'
                        if (!(err.response?.status === 404 && err.message === 'Not on waitlist') && err.message !== 'Not on waitlist') {
                            console.error('Error fetching user enrollment data:', err);
                        }
                        // Don't set error state for enrollment data, as it's not critical
                    }
                }
            } catch (err) {
                setError(err.message || 'Failed to load class details');
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetails();
    }, [id, user, initialized]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/classes/${id}` } });
            return;
        }

        if (!selectedDateIndex) {
            setEnrollError('Please select a date');
            return;
        }

        setEnrollLoading(true);
        setEnrollError('');
        try {
            if (isEnrolled) {
                await enrollmentService.cancelEnrollment(id);
                setIsEnrolled(false);
                showSuccess('Successfully unenrolled from class');
            } else {
                // Get the session ID from the selected date index
                const [rangeIndex, dayIndex] = selectedDateIndex.split('-');
                const session = classData.available_dates[rangeIndex].sessions[dayIndex];
                await enrollmentService.enrollInClass(id, { sessionId: session.id });
                setIsEnrolled(true);
                showSuccess('Successfully enrolled in class');
            }
        } catch (err) {
            setEnrollError(err.message || 'Enrollment operation failed');
            showError(err.message || 'Enrollment operation failed');
        } finally {
            setEnrollLoading(false);
        }
    };

    const handleDateSelection = (index) => {
        if (!user) {
            navigate('/login', { state: { from: `/classes/${id}` } });
            return;
        }
        setSelectedDateIndex(index);
        setEnrollError('');
    };

    const handleWaitlistAction = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/classes/${id}` } });
            return;
        }

        setWaitlistLoading(true);
        try {
            if (waitlistStatus) {
                await enrollmentService.leaveWaitlist(id);
                setWaitlistStatus(null);
                showSuccess('Removed from waitlist');
            } else {
                const result = await enrollmentService.joinWaitlist(id);
                setWaitlistStatus(result);
                showSuccess('Added to waitlist');
            }
        } catch (err) {
            showError(err.message || 'Failed to update waitlist status');
        } finally {
            setWaitlistLoading(false);
        }
    };

    // Memoize the formatted dates to prevent unnecessary recalculations
    const formattedDates = useMemo(() => {
        if (!classData?.available_dates) return [];

        return classData.available_dates.map((dateRange, rangeIndex) => {
            const availableSpots = classData.capacity - classData.enrolled_count;
            const isFull = availableSpots <= 0;
            const days = getDaysInRange(dateRange.start_date, dateRange.end_date);

            return {
                rangeIndex,
                startDate: new Date(dateRange.start_date).toLocaleDateString(),
                endDate: new Date(dateRange.end_date).toLocaleDateString(),
                days: days.map((day, dayIndex) => ({
                    date: day,
                    index: `${rangeIndex}-${dayIndex}`,
                    session: dateRange.sessions[dayIndex]
                })),
                isFull
            };
        });
    }, [classData]);

    // Memoize the class schedule
    const classSchedule = useMemo(() => {
        if (!classData) return [];
        return getDaysInRange(classData.startDate, classData.endDate)
            .filter(date => {
                const dayOfWeek = format(date, 'EEEE').toLowerCase();
                return classData.schedule[dayOfWeek];
            })
            .map(date => ({
                date,
                formattedDate: format(date, 'EEEE, MMMM d, yyyy'),
                time: classData.schedule[format(date, 'EEEE').toLowerCase()]
            }));
    }, [classData]);

    // Show loading state while auth is initializing or class data is loading
    if (authLoading || !initialized || loading) {
        return (
            <div className="min-h-screen bg-white font-montserrat">
                <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-xl text-gray-600">Loading class details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white font-montserrat">
                <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-xl text-red-600">{error}</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="min-h-screen bg-white font-montserrat">
                <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-xl text-gray-600">Class not found</p>
                </div>
                <Footer />
            </div>
        );
    }

    const isFull = classData.enrolled_count >= classData.capacity;

    return (
        <div className="min-h-screen bg-white font-montserrat">
            {/* Hero Section */}
            <section className="relative w-full h-[400px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-6" style={{ margin: '10px auto' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 z-0" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                    <h1 className="text-4xl md:text-5xl font-normal mb-4">{classData.title}</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">{classData.duration}</p>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Class Details */}
            <section className="py-16 max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column - Class Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">About This Class</h2>
                            <p className="text-gray-700 leading-relaxed">{classData.description}</p>
                        </div>

                        {formattedDates.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Available Days</h2>
                                <div className="space-y-6">
                                    {formattedDates.map(({ rangeIndex, startDate, endDate, days, isFull }) => (
                                        <div key={rangeIndex} className="border rounded-lg p-4">
                                            <div className="space-y-4">
                                                {days.map(({ date, index, session }) => {
                                                    // Calculate duration
                                                    const getDuration = (start, end) => {
                                                        if (!start || !end) return '';
                                                        const [sh, sm] = start.split(":").map(Number);
                                                        const [eh, em] = end.split(":").map(Number);
                                                        let startMins = sh * 60 + sm;
                                                        let endMins = eh * 60 + em;
                                                        let diff = endMins - startMins;
                                                        if (diff < 0) diff += 24 * 60; // handle overnight
                                                        const hours = Math.floor(diff / 60);
                                                        const mins = diff % 60;
                                                        return `${hours > 0 ? hours + ' hr' + (hours > 1 ? 's' : '') : ''}${hours > 0 && mins > 0 ? ' ' : ''}${mins > 0 ? mins + ' min' + (mins > 1 ? 's' : '') : ''}`;
                                                    };
                                                    const duration = getDuration(session.start_time, session.end_time);
                                                    // Only show date range if more than one day
                                                    const isOneDay = startDate === endDate;
                                                    return (
                                                        <div key={date.toISOString()} className="flex flex-col md:flex-row md:items-center md:justify-between border p-3 rounded mb-2 bg-gray-50">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {isOneDay ? startDate : `${startDate} - ${endDate}`}
                                                                </div>
                                                                <div className="text-gray-700 text-sm">
                                                                    {`${formatTime(session.start_time)} - ${formatTime(session.end_time)}`}
                                                                    {duration && (
                                                                        <span className="ml-2 text-xs text-gray-500">({duration})</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 md:mt-0 md:ml-4 flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        if (isAdminOrInstructor) {
                                                                            setRoleEnrollError('Admins and instructors cannot enroll in classes.');
                                                                            return;
                                                                        }
                                                                        handleDateSelection(index);
                                                                    }}
                                                                    className={`px-4 py-2 rounded text-white font-medium transition-colors ${selectedDateIndex === index ? 'bg-black' : 'bg-blue-600 hover:bg-blue-700'}${isAdminOrInstructor ? ' opacity-50 cursor-not-allowed' : ''}`}
                                                                    disabled={isFull && !waitlistStatus || isAdminOrInstructor}
                                                                >
                                                                    {isEnrolled && selectedDateIndex === index ? 'Cancel Enrollment' : 'Enroll Now'}
                                                                </button>
                                                                {isFull && classData.waitlist_enabled && (
                                                                    waitlistStatus ? (
                                                                        <button
                                                                            onClick={handleWaitlistAction}
                                                                            disabled={waitlistLoading}
                                                                            className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            {waitlistLoading ? 'Processing...' : 'Leave Waitlist'}
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={handleWaitlistAction}
                                                                            disabled={waitlistLoading}
                                                                            className="px-4 py-2 rounded text-white bg-blue-400 hover:bg-blue-500"
                                                                        >
                                                                            {waitlistLoading ? 'Processing...' : 'Join Waitlist'}
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Location</h2>
                            <p className="text-gray-700">
                                <span className="font-medium">Type:</span> {classData.location_type}<br />
                                <span className="font-medium">Details:</span> {classData.location_details}
                            </p>
                        </div>

                    </div>

                    {/* Right Column - Enrollment Card */}
                    <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2 text-gray-900">Enrollment</h2>
                                <p className="text-3xl font-semibold text-blue-600">${classData.price}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">Certificate of Completion</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">Expert Instruction</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">Hands-on Learning</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gray-100 py-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-semibold mb-4 text-gray-900">Ready to Learn?</h2>
                    <p className="mb-8 text-gray-700">Join us for this exciting class and take the next step in your professional development.</p>
                    {user ? (
                        !isEnrolled && classData.enrolled_count < classData.capacity && (
                            <button
                                onClick={handleEnroll}
                                className="bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                            >
                                Enroll Now
                            </button>
                        )
                    ) : (
                        <button
                            onClick={() => navigate('/login', { state: { from: `/classes/${id}` } })}
                            className="bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                        >
                            Log in to Enroll
                        </button>
                    )}
                </div>
            </section>

            {/* Show error if admin/instructor tries to enroll */}
            {roleEnrollError && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded flex items-center justify-between">
                    <span>{roleEnrollError}</span>
                    <button
                        onClick={() => setRoleEnrollError('')}
                        className="ml-4 text-red-700 hover:text-red-900 font-bold text-lg focus:outline-none"
                        aria-label="Close error message"
                    >
                        ×
                    </button>
                </div>
            )}

            <Footer />
        </div>
    );
}

const MemoizedClassDetails = React.memo(ClassDetails);
export default MemoizedClassDetails; 