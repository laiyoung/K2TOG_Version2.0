import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';

const Signup = () => {
    const navigate = useNavigate();
    const { register, error: authError, clearError } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.email.includes('@')) {
            errors.email = 'Please enter a valid email address';
        }
        if (formData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }
        if (formData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear validation errors when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        // Clear auth errors
        if (error || authError) {
            setError('');
            clearError();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setValidationErrors({});

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...formFields } = formData;
            // Transform the data to match backend expectations
            const signupData = {
                name: `${formFields.firstName} ${formFields.lastName}`,
                email: formFields.email,
                password: formFields.password,
                role: 'student', // Default role for new registrations
                status: 'active',
                first_name: formFields.firstName,
                last_name: formFields.lastName,
                phone_number: null,
                email_notifications: true,
                sms_notifications: false
            };
            await register(signupData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getInputClassName = (fieldName) => {
        const baseClasses = "w-full px-4 py-3 border focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed";
        const errorClasses = validationErrors[fieldName] ? "border-red-300" : "border-gray-200 focus:border-black";
        return `${baseClasses} ${errorClasses}`;
    };

    return (
        <div className="bg-white min-h-screen font-montserrat">
            {/* Hero Section */}
            <section className="relative w-full h-[300px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-6" style={{ margin: '10px auto' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 z-0" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                    <h1 className="text-4xl md:text-5xl font-normal mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Create Account</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90" style={{ fontFamily: 'Montserrat, sans-serif' }}>Join our community of childcare professionals</p>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Signup Form */}
            <section className="py-16 max-w-md mx-auto px-6">
                {(error || authError) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error || authError}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="block text-sm uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                                First name
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={loading}
                                className={getInputClassName('firstName')}
                                style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                            />
                            {validationErrors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                                Last name
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={loading}
                                className={getInputClassName('lastName')}
                                style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                            />
                            {validationErrors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                            )}
                        </div>
                    </div>

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
                            className={getInputClassName('email')}
                            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            className={getInputClassName('password')}
                            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                        />
                        {validationErrors.password && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                            className={getInputClassName('confirmPassword')}
                            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                        />
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                        )}
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
                                    <span className="opacity-0">CREATE ACCOUNT</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                </>
                            ) : (
                                'CREATE ACCOUNT'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="text-black hover:underline" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Login
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

export default Signup; 