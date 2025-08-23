import { useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function Contact() {
    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="bg-white min-h-screen font-montserrat">

            {/* Hero Section */}
            <section className="w-full" style={{ marginBottom: '48px' }}>
                <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-black flex items-center justify-center">
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal px-4 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact Us</h1>
                </div>
            </section>

            {/* Contact Form and Info */}
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-12 mb-16 sm:mb-20 lg:mb-24 px-4 sm:px-6 lg:px-8">
                {/* Form Card */}
                <div className="bg-white border border-gray-200 rounded-none shadow-none p-6 sm:p-8 lg:p-12 flex-1" style={{ minWidth: '280px' }}>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center lg:text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact us</h2>
                    <form className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Name</label>
                            <input type="text" placeholder="Enter your name" className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base font-normal" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email Address</label>
                            <input type="email" placeholder="Enter your email" className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base font-normal" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Message</label>
                            <textarea placeholder="Hi there, I'm reaching out because I think we can collaborate..." className="w-full border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 h-24 sm:h-32 resize-none focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base font-normal" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }} />
                        </div>
                        <button type="submit" className="w-full bg-black text-white py-2 sm:py-3 font-semibold tracking-wide hover:bg-gray-900 transition text-sm sm:text-base" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }}>SUBMIT</button>
                    </form>
                </div>
                {/* Office Info */}
                <div className="flex-1 flex flex-col justify-start pt-6 lg:pt-0 lg:pl-8 text-gray-700 text-sm sm:text-base text-center lg:text-left" style={{ minWidth: '260px' }}>
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-xs font-bold uppercase mb-2 tracking-widest text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Office</h3>
                        <p style={{ fontFamily: 'Montserrat, sans-serif' }}>1110 East 93rd Street,<br />Brooklyn,<br />NY 11216</p>
                    </div>
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-xs font-bold uppercase mb-2 tracking-widest text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Working Hours</h3>
                        <p style={{ fontFamily: 'Montserrat, sans-serif' }}>9AM - 3PM, Mon to Fri</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase mb-2 tracking-widest text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact</h3>
                        <p><a href="mailto:yvelisse225@gmail.com" className="underline hover:text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>yvelisse225@gmail.com</a></p>
                        <p><a href="tel:19172047844" className="underline hover:text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>1-917-204-7844</a></p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Contact; 