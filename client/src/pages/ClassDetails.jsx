import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Mock data for development
const mockClasses = [
    {
        id: 1,
        title: "Child Development Associate (CDA) Preparation",
        description: "This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. Learn about child development, curriculum planning, and professional practices. Perfect for those seeking to advance their career in early childhood education.",
        location_type: "Online",
        location_details: "Virtual Classroom - Zoom",
        price: 299.99,
        capacity: 20,
        enrolled_count: 12,
        duration: "12 weeks",
        available_dates: [
            {
                start_date: "2024-04-15",
                end_date: "2024-07-08",
                time: "6:00 PM - 8:00 PM",
                days: "Mondays and Wednesdays"
            },
            {
                start_date: "2024-05-01",
                end_date: "2024-07-24",
                time: "7:00 PM - 9:00 PM",
                days: "Tuesdays and Thursdays"
            },
            {
                start_date: "2024-06-01",
                end_date: "2024-08-24",
                time: "10:00 AM - 12:00 PM",
                days: "Saturdays"
            }
        ]
    },
    {
        id: 2,
        title: "Development and Operations",
        description: "Master the essential skills needed to run a successful childcare program. Learn about business operations, staff management, curriculum development, and regulatory compliance. This course is ideal for current and aspiring childcare center directors.",
        location_type: "In-Person",
        location_details: "123 Education St, Suite 100, City, State 12345",
        price: 349.99,
        capacity: 15,
        enrolled_count: 15,
        duration: "8 weeks",
        available_dates: [
            {
                start_date: "2024-04-20",
                end_date: "2024-06-15",
                time: "9:00 AM - 12:00 PM",
                days: "Saturdays"
            },
            {
                start_date: "2024-05-15",
                end_date: "2024-07-10",
                time: "6:00 PM - 9:00 PM",
                days: "Wednesdays"
            }
        ]
    },
    {
        id: 3,
        title: "CPR and First Aid Certification",
        description: "Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This course meets state licensing requirements and provides certification valid for two years.",
        location_type: "Hybrid",
        location_details: "Combined Online and In-Person Sessions",
        price: 149.99,
        capacity: 25,
        enrolled_count: 8,
        duration: "2 days",
        available_dates: [
            {
                start_date: "2024-05-01",
                end_date: "2024-05-02",
                time: "9:00 AM - 4:00 PM",
                days: "Both Days"
            },
            {
                start_date: "2024-06-15",
                end_date: "2024-06-16",
                time: "9:00 AM - 4:00 PM",
                days: "Both Days"
            },
            {
                start_date: "2024-07-20",
                end_date: "2024-07-21",
                time: "9:00 AM - 4:00 PM",
                days: "Both Days"
            }
        ]
    }
];

function ClassDetails() {
    const { id } = useParams();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);

    useEffect(() => {
        // Simulate API call with setTimeout
        const fetchClassDetails = () => {
            try {
                // Find class in mock data
                const foundClass = mockClasses.find(c => c.id === parseInt(id));
                if (!foundClass) {
                    throw new Error('Class not found');
                }
                setClassData(foundClass);
                // Mock enrollment status
                setIsEnrolled(Math.random() > 0.7); // Randomly set enrollment status for demo
            } catch (err) {
                setError(err.message || 'Failed to load class details');
            } finally {
                setLoading(false);
            }
        };

        // Simulate network delay
        setTimeout(fetchClassDetails, 500);
    }, [id]);

    const handleEnroll = () => {
        // Mock enrollment process
        alert('Enrollment functionality will be implemented with the API');
        // For now, just toggle enrollment status
        setIsEnrolled(!isEnrolled);
    };

    const handleDateSelection = (index) => {
        setSelectedDateIndex(index);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white font-montserrat">
                <Header />
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
                <Header />
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
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-xl text-gray-600">Class not found</p>
                </div>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white font-montserrat">
            <Header />

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

                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Available Dates</h2>
                            <div className="space-y-4">
                                {classData.available_dates.map((date, index) => {
                                    const availableSpots = classData.capacity - classData.enrolled_count;
                                    const isFull = availableSpots <= 0;

                                    return (
                                        <div
                                            key={index}
                                            className={`border rounded-lg p-4 transition-colors ${selectedDateIndex === index
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                } ${isFull ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="radio"
                                                    id={`date-${index}`}
                                                    name="class-date"
                                                    value={index}
                                                    checked={selectedDateIndex === index}
                                                    onChange={() => handleDateSelection(index)}
                                                    disabled={isFull}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`date-${index}`}
                                                        className={`block cursor-pointer ${isFull ? 'cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-gray-900 font-medium mb-1">
                                                                    {formatDate(date.start_date)} - {formatDate(date.end_date)}
                                                                </p>
                                                                <p className="text-gray-700 text-sm">
                                                                    <span className="font-medium">Time:</span> {date.time}
                                                                </p>
                                                                <p className="text-gray-700 text-sm">
                                                                    <span className="font-medium">Days:</span> {date.days}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-green-600'
                                                                    }`}>
                                                                    {isFull ? 'Class Full' : `${availableSpots} spots available`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

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

                            {isEnrolled ? (
                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-gray-600 px-8 py-4 font-normal border-0 cursor-not-allowed"
                                >
                                    Already Enrolled
                                </button>
                            ) : selectedDateIndex === null ? (
                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-gray-600 px-8 py-4 font-normal border-0 cursor-not-allowed"
                                >
                                    Please Select a Date
                                </button>
                            ) : classData.enrolled_count >= classData.capacity ? (
                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-gray-600 px-8 py-4 font-normal border-0 cursor-not-allowed"
                                >
                                    Class Full
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    className="w-full bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                                >
                                    Enroll Now
                                </button>
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
                    {!isEnrolled && classData.enrolled_count < classData.capacity && (
                        <button
                            onClick={handleEnroll}
                            className="bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                        >
                            Enroll Now
                        </button>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default ClassDetails; 