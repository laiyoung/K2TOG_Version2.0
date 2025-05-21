import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, error: authError, clearError } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get the redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear any existing errors when user types
        if (error || authError) {
            setError('');
            clearError();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen font-montserrat">

            {/* Hero Section */}
            <section className="relative w-full h-[300px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-6" style={{ margin: '10px auto' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 z-0" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                    <h1 className="text-4xl md:text-5xl font-normal mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Login</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90" style={{ fontFamily: 'Montserrat, sans-serif' }}>Access your account to manage your classes and profile</p>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Login Form */}
            <section className="py-16 max-w-md mx-auto px-6">
                {(error || authError) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error || authError}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
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
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed relative"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}
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

                <div className="mt-8 text-center">
                    <p className="text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>
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