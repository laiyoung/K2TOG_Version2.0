import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function Landing() {
    return (
        <div className="bg-white min-h-screen font-montserrat">
            {/* Hero Section */}
            <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[620px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-4 sm:px-6 lg:px-8" style={{ margin: '10px auto' }}>
                <img src="/images/hero-img.jpg" alt="Hero" className="absolute inset-0 w-full h-full object-cover object-center z-0" />
                <div className="absolute inset-0 bg-black opacity-30 z-10" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full px-4">
                    <h1 className="hero-title font-normal mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Grow your business.
                    </h1>
                    <h3 className="hero-txt mb-6 sm:mb-8 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                        Give your business a boost with a beautifully crafted homepage.
                    </h3>
                    <button
                        onClick={() => document.getElementById('who-we-are').scrollIntoView({ behavior: 'smooth' })}
                        className="hero-button bg-white text-black px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 font-normal border-0 hover:bg-gray-100 transition-colors text-sm sm:text-base"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                    >
                        LEARN MORE
                    </button>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Belief Statement */}
            <section id="statement-container" className="text-center px-4 sm:px-6 lg:px-8" style={{ margin: '80px auto', maxWidth: '1200px' }}>
                <p id="statement-title" className="uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '11px', fontFamily: 'Montserrat, sans-serif' }}>WHAT WE BELIEVE IN</p>
                <p id="statement-text" className="mb-2 text-xl sm:text-2xl md:text-3xl lg:text-[34px] px-4" style={{ color: 'black', fontFamily: 'Montserrat, sans-serif' }}>
                    Grow your business, establish your brand, and put children first.
                </p>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Who we are */}
            <section id="who-we-are" className="py-8 sm:py-12 lg:py-16 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8">
                <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                    <h3 className="text-xl sm:text-2xl lg:text-[28px] font-semibold mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Who we are</h3>
                    <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Nulla vel sodales tellus, quis condimentum enim. Nunc porttitor venenatis feugiat. Etiam quis faucibus erat, non accumsan leo. Aliquam erat volutpat. Vestibulum ac faucibus eros. Cras ullamcorper gravida tellus ut consequat.
                    </p>
                    <Link to="/classes" className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-normal border-0 hover:bg-gray-900 transition-colors text-sm sm:text-base inline-block" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                        LEARN MORE
                    </Link>
                </div>
                <img src="/images/whoImg.jpeg" alt="Who we are" className="flex-1 w-full max-w-[500px] h-[250px] sm:h-[300px] lg:h-[350px] object-cover order-1 lg:order-2" />
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* What we do */}
            <section className="py-8 sm:py-12 lg:py-16 max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8">
                <div className="flex-1 text-center lg:text-left order-2">
                    <h3 className="text-xl sm:text-2xl lg:text-[28px] font-semibold mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>What we do</h3>
                    <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Nulla vel sodales tellus, quis condimentum enim. Nunc porttitor venenatis feugiat. Etiam quis faucibus erat, non accumsan leo. Aliquam erat volutpat. Vestibulum ac faucibus eros. Cras ullamcorper gravida tellus ut consequat.
                    </p>
                    <Link to="/classes" className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-normal border-0 hover:bg-gray-900 transition-colors text-sm sm:text-base inline-block" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                        LEARN MORE
                    </Link>
                </div>
                <img src="/images/whatImg.jpeg" alt="What we do" className="flex-1 w-full max-w-[500px] h-[250px] sm:h-[300px] lg:h-[350px] object-cover order-1" />
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Call to Action */}
            <section className="bg-gray-100 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Grow your business.</h2>
                    <p className="mb-6 sm:mb-8 text-gray-700 text-sm sm:text-base lg:text-lg px-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Today is the day to build the business of your dreams. Share your mission with the world — and blow your customers away.
                    </p>
                    <Link to="/contact" className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-normal border-0 hover:bg-gray-900 transition-colors text-sm sm:text-base inline-block" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                        START NOW
                    </Link>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default Landing; 