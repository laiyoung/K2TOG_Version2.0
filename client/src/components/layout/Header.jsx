import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
    const { user, logout, loading, initialized } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    // Check screen size and automatically switch to mobile view
    useEffect(() => {
        const checkScreenSize = () => {
            // Switch to mobile view when screen width is less than 1024px (lg breakpoint)
            // This ensures the toggle menu appears before the navigation becomes cramped
            setIsMobileView(window.innerWidth < 1024);
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
                className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
            >
                About
            </Link>
            <Link
                to="/classes"
                className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
            >
                Classes
            </Link>
            <Link
                to="/contact"
                className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
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
                    className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
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
            <div className="flex items-center space-x-4">
                {!isAdminRoute && userRole !== 'admin' && (
                    <Link
                        to="/profile"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Profile
                    </Link>
                )}
                {userRole === 'admin' && (
                    <Link
                        to="/admin/analytics"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Admin
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                >
                    Logout
                </button>
            </div>
        );
    }, [user, initialized, loading, isAdminRoute, handleLogout]);

    // Memoize the menu toggle handler
    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    return (
        <header className="bg-white shadow-sm relative z-[1400]">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <div className="h-[120px] w-[400px] overflow-hidden">
                                <img
                                    src="/images/logo-img.png"
                                    alt="YJ Child Care Plus Inc."
                                    className="h-full w-full object-contain scale-125"
                                />
                            </div>
                        </Link>
                        {/* Show navigation links only when NOT in mobile view */}
                        {!isMobileView && (
                            <div className="ml-6 flex space-x-8 items-center">
                                {navigationLinks}
                            </div>
                        )}
                    </div>
                    {/* Show auth links only when NOT in mobile view */}
                    {!isMobileView && (
                        <div className="ml-6 flex items-center">
                            {authLinks}
                        </div>
                    )}
                    {/* Show toggle button when in mobile view */}
                    {isMobileView && (
                        <div className="flex items-center">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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

            {/* Mobile menu - show when menu is open AND in mobile view */}
            {isMenuOpen && isMobileView && (
                <div className="lg:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {navigationLinks}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {authLinks}
                    </div>
                </div>
            )}
        </header>
    );
}

// Export the memoized component
const MemoizedHeader = React.memo(Header);
export default MemoizedHeader; 