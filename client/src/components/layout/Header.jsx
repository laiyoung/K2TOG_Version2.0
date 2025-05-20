import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // You'll need to create this context

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="w-full bg-white font-montserrat px-6 py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <div className="h-[120px] w-[400px] overflow-hidden">
                        <img
                            src="/images/logo-img.png"
                            alt="YJ Child Care Plus Inc."
                            className="h-full w-full object-contain scale-125"
                        />
                    </div>
                </Link>
                <nav className="flex items-center space-x-8">
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
                        to="#"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Resources
                    </Link>
                    <Link
                        to="/contact"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Contact
                    </Link>

                    {/* Authentication Links */}
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                            >
                                Profile
                            </Link>
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
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
                    ) : (
                        <Link
                            to="/login"
                            className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                        >
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header; 