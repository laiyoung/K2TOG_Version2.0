import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../utils/notificationUtils';
import Footer from '../components/layout/Footer';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, error, clearError, loading } = useAuth();
    const { showError } = useNotifications();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Get the redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';

    console.log('Login component rendered with state:', { from, error, loading }); // Debug log

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        console.log('Form field changed:', { name, value }); // Debug log
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any previous errors when user starts typing
        if (error) {
            clearError();
        }
    }, [error, clearError]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        console.log('Login form submitted with data:', formData); // Debug log

        try {
            console.log('Calling login function...'); // Debug log
            const userData = await login(formData.email, formData.password);
            console.log('Login successful, user data:', userData); // Debug log
            console.log('Navigating to:', from); // Debug log
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error in component:', err); // Debug log
            showError(err.message || 'Login failed. Please try again.');
        }
    }, [formData, login, navigate, showError, from]);

    // Add effect to monitor auth state
    useEffect(() => {
        console.log('Login component auth state changed:', { error, loading }); // Debug log
    }, [error, loading]);

    return (
        <div className="bg-white min-h-screen font-montserrat">

            {/* Hero Section */}
            <section className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-4 sm:px-6 lg:px-8" style={{ margin: '10px auto' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 z-0" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Login</h1>
                    <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto opacity-90 px-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Access your account to manage your classes and profile</p>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Login Form */}
            <section className="py-8 sm:py-12 lg:py-16 max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-normal border-0 hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed relative text-sm sm:text-base"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                            onClick={() => console.log('Login button clicked')} // Debug log
                        >
                            {loading ? (
                                <>
                                    <span className="opacity-0">LOGIN</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                </>
                            ) : (
                                'LOGIN'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 sm:mt-8 text-center">
                    <p className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-black hover:underline" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            <Footer />
        </div>
    );
};

export default Login; 