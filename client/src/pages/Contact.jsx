import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function Contact() {
    return (
        <div className="bg-white min-h-screen font-montserrat">
            <Header />
            {/* Hero Section */}
            <section className="w-full" style={{ marginBottom: '48px' }}>
                <div className="w-full h-[300px] bg-black flex items-center justify-center">
                    <h1 className="text-white text-5xl font-normal" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact Us</h1>
                </div>
            </section>

            {/* Contact Form and Info */}
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 mb-24 px-4">
                {/* Form Card */}
                <div className="bg-white border border-gray-200 rounded-none shadow-none p-12 flex-1" style={{ minWidth: '320px' }}>
                    <h2 className="text-2xl font-semibold mb-8 text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact us</h2>
                    <form className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Name</label>
                            <input type="text" placeholder="Enter your name" className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black text-base font-normal" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email Address</label>
                            <input type="email" placeholder="Enter your email" className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black text-base font-normal" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Message</label>
                            <textarea placeholder="Hi there, I'm reaching out because I think we can collaborate..." className="w-full border border-gray-300 px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-black text-base font-normal" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }} />
                        </div>
                        <button type="submit" className="w-full bg-black text-white py-3 font-semibold tracking-wide hover:bg-gray-900 transition" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }}>SUBMIT</button>
                    </form>
                </div>
                {/* Office Info */}
                <div className="flex-1 flex flex-col justify-start pt-8 md:pt-0 md:pl-8 text-gray-700 text-base" style={{ minWidth: '260px' }}>
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase mb-2 tracking-widest text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Office</h3>
                        <p style={{ fontFamily: 'Montserrat, sans-serif' }}>1110 East 93rd Street,<br />Brooklyn,<br />NY 11216</p>
                    </div>
                    <div className="mb-8">
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