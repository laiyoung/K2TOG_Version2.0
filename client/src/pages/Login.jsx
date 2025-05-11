import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement login logic
        console.log('Login attempt with:', formData);
    };

    return (
        <div className="bg-white min-h-screen font-montserrat">
            <Header />

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
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px' }}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}
                        >
                            LOGIN
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