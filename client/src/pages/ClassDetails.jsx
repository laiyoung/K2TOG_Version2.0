import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';
import classService from '../services/classService';
import enrollmentService from '../services/enrollmentService';

function ClassDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);

    useEffect(() => {
        const fetchClassDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await classService.getClassById(id);
                setClassData(data);
                // Only check enrollment status if user is logged in
                if (user) {
                    const enrollments = await enrollmentService.getUserEnrollments();
                    const isUserEnrolled = enrollments.some(enrollment => enrollment.class_id === id);
                    setIsEnrolled(isUserEnrolled);
                }
            } catch (err) {
                setError(err.message || 'Failed to load class details');
            } finally {
                setLoading(false);
            }
        };
        fetchClassDetails();
    }, [id, user]);

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
            } else {
                // Get the session ID from the selected date index
                const [rangeIndex, dayIndex] = selectedDateIndex.split('-');
                const session = classData.available_dates[rangeIndex].sessions[dayIndex];
                await enrollmentService.enrollInClass(id, { sessionId: session.id });
                setIsEnrolled(true);
            }
        } catch (err) {
            setEnrollError(err.message || 'Enrollment operation failed');
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

    if (loading) {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysInRange = (startDate, endDate) => {
        const days = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);

        while (current <= end) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    };

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

                        {classData.available_dates && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Available Days</h2>
                                <div className="space-y-6">
                                    {classData.available_dates.map((dateRange, rangeIndex) => {
                                        const availableSpots = classData.capacity - classData.enrolled_count;
                                        const isFull = availableSpots <= 0;
                                        const days = getDaysInRange(dateRange.start_date, dateRange.end_date);

                                        return (
                                            <div key={rangeIndex} className="border rounded-lg p-6 bg-white">
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        {formatDate(dateRange.start_date)} - {formatDate(dateRange.end_date)}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        <span className="font-medium">Time:</span> {dateRange.time}
                                                    </p>
                                                    <p className="text-gray-600 text-sm">
                                                        <span className="font-medium">Days:</span> {dateRange.days}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    {days.map((day, dayIndex) => {
                                                        const dayId = `day-${rangeIndex}-${dayIndex}`;
                                                        const isSelected = selectedDateIndex === `${rangeIndex}-${dayIndex}`;

                                                        return (
                                                            <div
                                                                key={dayId}
                                                                className={`flex items-center p-3 rounded-lg border transition-colors ${isSelected
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                    } ${isFull ? 'opacity-60' : ''}`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    id={dayId}
                                                                    name="class-day"
                                                                    value={`${rangeIndex}-${dayIndex}`}
                                                                    checked={isSelected}
                                                                    onChange={() => handleDateSelection(`${rangeIndex}-${dayIndex}`)}
                                                                    disabled={isFull}
                                                                    className="mr-3"
                                                                />
                                                                <label
                                                                    htmlFor={dayId}
                                                                    className={`flex-1 cursor-pointer ${isFull ? 'cursor-not-allowed' : ''}`}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-900">
                                                                            {formatDate(day)}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <span className="text-blue-600 text-sm font-medium">
                                                                                Selected
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-4 text-right">
                                                    <p className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                                                        {isFull ? 'Class Full' : `${availableSpots} spots available`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
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

                            {enrollError && <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded">{enrollError}</div>}

                            {user ? (
                                <div>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrollLoading || (isEnrolled && !enrollmentService.canUnenroll)}
                                        className="bg-black text-white px-6 py-3 rounded disabled:bg-gray-400"
                                    >
                                        {enrollLoading ? 'Processing...' : isEnrolled ? 'Unenroll' : 'Enroll'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-gray-700">Please log in to enroll in this class.</p>
                                    <button
                                        onClick={() => navigate('/login', { state: { from: `/classes/${id}` } })}
                                        className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
                                    >
                                        Log in to Enroll
                                    </button>
                                </div>
                            )}
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

            <Footer />
        </div>
    );
}

export default ClassDetails; 