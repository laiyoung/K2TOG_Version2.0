import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
    const { user, logout, loading, initialized } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(true); // Temporarily force mobile view for testing

    // Check screen size and automatically switch to mobile view
    useEffect(() => {
        const checkScreenSize = () => {
            // Switch to mobile view when screen width is less than 1024px (lg breakpoint)
            // This ensures the toggle menu appears before the navigation becomes cramped
            const isMobile = window.innerWidth < 1024;
            console.log('Screen size check:', window.innerWidth, 'isMobile:', isMobile);
            setIsMobileView(isMobile);
        };

        // Check on mount
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Debug logging for auth state
    console.log('Header auth state:', { user, loading, initialized });
    console.log('Header menu state:', { isMenuOpen, isClosing, isMobileView });

    // Memoize the logout handler
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [logout, navigate]);

    // Memoize the navigation links
    const navigationLinks = useMemo(() => (
        <>
            <Link
                to="/"
                className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
            >
                About
            </Link>
            <Link
                to="/classes"
                className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
            >
                Classes
            </Link>
            <Link
                to="/contact"
                className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
            >
                Contact
            </Link>
        </>
    ), []);

    // Memoize the auth links
    const authLinks = useMemo(() => {
        console.log('Rendering auth links with state:', { user, initialized, loading }); // Debug log

        if (!initialized || loading) {
            return (
                <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            );
        }

        if (!user) {
            console.log('No user, showing login link'); // Debug log
            return (
                <Link
                    to="/login"
                    className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                >
                    Login
                </Link>
            );
        }

        // Ensure user and user.role are defined before rendering
        const userRole = user?.role;
        console.log('User exists, showing profile/logout links'); // Debug log
        return (
            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
                {!isAdminRoute && userRole !== 'admin' && (
                    <Link
                        to="/profile"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Profile
                    </Link>
                )}
                {userRole === 'admin' && (
                    <Link
                        to="/admin/analytics"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Admin
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="nav-button uppercase text-gray-500 hover:text-black transition-colors block w-full text-center py-3 lg:py-0 lg:w-auto"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                >
                    Logout
                </button>
            </div>
        );
    }, [user, initialized, loading, isAdminRoute, handleLogout]);

    // Memoize the menu toggle handler
    const toggleMenu = useCallback(() => {
        console.log('toggleMenu called, current isMenuOpen:', isMenuOpen);
        if (isMenuOpen) {
            // Start closing animation
            setIsClosing(true);
            // Wait for animation to complete before hiding
            setTimeout(() => {
                setIsMenuOpen(false);
                setIsClosing(false);
            }, 300);
        } else {
            console.log('Setting isMenuOpen to true');
            setIsMenuOpen(true);
        }
    }, [isMenuOpen]);

    // Close mobile menu when route changes
    const closeMenu = useCallback(() => {
        if (isMenuOpen) {
            // Start closing animation
            setIsClosing(true);
            setTimeout(() => {
                setIsMenuOpen(false);
                setIsClosing(false);
            }, 300);
        }
    }, [isMenuOpen]);

    useEffect(() => {
        // Only close menu when route changes, not on every render
        if (isMenuOpen) {
            closeMenu();
        }
    }, [location.pathname]);

    return (
        <header className="bg-white shadow-sm relative z-[1400]">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <div className="h-[80px] w-[240px] sm:h-[90px] sm:w-[270px] lg:h-[100px] lg:w-[300px] overflow-hidden">
                                <img
                                    src="/images/logo-img.png"
                                    alt="YJ Child Care Plus Inc."
                                    className="h-full w-full object-contain scale-125"
                                />
                            </div>
                        </Link>
                        {/* Show navigation links only when NOT in mobile view */}
                        {!isMobileView && (
                            <div className="ml-4 sm:ml-6 lg:ml-6 flex space-x-4 sm:space-x-6 lg:space-x-8 items-center">
                                {navigationLinks}
                            </div>
                        )}
                    </div>
                    {/* Show auth links only when NOT in mobile view */}
                    {!isMobileView && (
                        <div className="ml-4 sm:ml-6 lg:ml-6 flex items-center">
                            {authLinks}
                        </div>
                    )}
                    {/* Show toggle button when in mobile view */}
                    {isMobileView && (
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    console.log('Button clicked!');
                                    toggleMenu();
                                }}
                                className="mobile-menu-toggle-button inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
                                aria-label="Toggle navigation menu"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile menu overlay - always rendered but controlled by CSS classes */}
            {isMobileView && (
                <div className={`mobile-menu-overlay lg:hidden ${isMenuOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
                    <div className="mobile-menu-content">
                        <div className="mobile-menu-header">
                            <h3 className="mobile-menu-title">Navigation</h3>
                            <button
                                onClick={closeMenu}
                                className="mobile-menu-close"
                                aria-label="Close navigation menu"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mobile-menu-sections">
                            <div className="mobile-menu-section">
                                <h4 className="mobile-menu-section-title">Main Navigation</h4>
                                <div className="mobile-menu-links">
                                    {navigationLinks}
                                </div>
                            </div>
                            <div className="mobile-menu-section">
                                <h4 className="mobile-menu-section-title">Account</h4>
                                <div className="mobile-menu-links">
                                    {authLinks}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

// Export the memoized component
const MemoizedHeader = React.memo(Header);
export default MemoizedHeader; 