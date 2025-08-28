import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classService from '../../services/classService';

function Footer() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classService.getAllClasses();
                setClasses(data);
            } catch (error) {
                console.error('Error fetching classes for footer:', error);
                // Don't break the footer if classes can't be loaded
                // Set empty array to prevent errors
                setClasses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    // Helper function to get class link by title
    const getClassLink = (title) => {
        const classItem = classes.find(c => c.title === title);
        return classItem ? `/classes/${classItem.id}` : '#';
    };

    // Function to handle navigation with scroll to top
    const handleClassNavigation = (title) => {
        const link = getClassLink(title);
        if (link !== '#') {
            // Scroll to top before navigation
            window.scrollTo(0, 0);
            // Navigate to the class details page
            navigate(link);
        }
    };

    return (
        <footer className="w-full bg-white font-montserrat border-t border-gray-200 mt-12 sm:mt-16 lg:mt-24 pt-8 sm:pt-10 lg:pt-12 pb-4 text-[#222] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start px-4 sm:px-6 lg:px-8 gap-6 sm:gap-8">
                <div className="mb-6 lg:mb-0 flex flex-col items-center lg:items-start w-full lg:w-auto" style={{ minWidth: '220px' }}>
                    <img
                        src="/images/logo-img.png"
                        alt="YJ Child Care Plus Inc."
                        className="h-[80px] sm:h-[90px] lg:h-[100px] w-[240px] sm:w-[270px] lg:w-[300px] object-cover object-left mb-4"
                    />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full">
                    <div className="text-center lg:text-left">
                        <div className="text-[#979797] text-xs mb-3 uppercase tracking-widest">Classes</div>
                        {loading ? (
                            <div className="text-[#222] text-sm">Loading...</div>
                        ) : classes.length > 0 ? (
                            <>
                                <div className="mb-2">
                                    <button
                                        onClick={() => handleClassNavigation('Development and Operations')}
                                        className="text-[#222] no-underline hover:underline text-sm bg-transparent border-none cursor-pointer p-0 text-left"
                                    >
                                        Development and Operations
                                    </button>
                                </div>
                                <div className="mb-2">
                                    <button
                                        onClick={() => handleClassNavigation('Child Development Associate (CDA)')}
                                        className="text-[#222] no-underline hover:underline text-sm bg-transparent border-none cursor-pointer p-0 text-left"
                                    >
                                        CDA
                                    </button>
                                </div>
                                <div className="mb-2">
                                    <button
                                        onClick={() => handleClassNavigation('CPR and First Aid Certification')}
                                        className="text-[#222] no-underline hover:underline text-sm bg-transparent border-none cursor-pointer p-0 text-left"
                                    >
                                        CPR
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Fallback static links when API fails
                            <>
                                <div className="mb-2">
                                    <Link to="/classes" className="text-[#222] no-underline hover:underline text-sm">
                                        Development and Operations
                                    </Link>
                                </div>
                                <div className="mb-2">
                                    <Link to="/classes" className="text-[#222] no-underline hover:underline text-sm">
                                        CDA
                                    </Link>
                                </div>
                                <div className="mb-2">
                                    <Link to="/classes" className="text-[#222] no-underline hover:underline text-sm">
                                        CPR
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                    {/* <div className="text-center lg:text-left">
                        <div className="text-[#979797] text-xs mb-3 uppercase tracking-widest">Resources</div>
                        <div className="mb-2"><Link to="#" className="text-[#222] no-underline hover:underline text-sm">Applications</Link></div>
                        <div className="mb-2"><Link to="#" className="text-[#222] no-underline hover:underline text-sm">Scholarships</Link></div>
                    </div>
                    <div className="text-center lg:text-left col-span-1 sm:col-span-2 lg:col-span-1">
                        <div className="text-[#979797] text-xs mb-3 uppercase tracking-widest">Subscribe</div>
                        <form className="flex mt-2 justify-center lg:justify-start">
                            <input 
                                type="email" 
                                placeholder="Enter email for updates" 
                                className="border border-gray-300 px-3 py-2 text-xs focus:outline-none flex-1 max-w-[200px]" 
                                style={{ fontFamily: 'Montserrat, sans-serif' }} 
                            />
                            <button type="submit" className="bg-black text-white px-4 text-xs py-2">→</button>
                        </form>
                    </div> */}
                </div>
            </div>
            <div className="w-full text-center text-[#979797] text-xs mt-6 sm:mt-8 pt-4 border-t border-gray-100 px-4">
                © 2022 YJ Child Care Plus Inc. All rights reserved
            </div>
        </footer>
    );
}

export default Footer; 