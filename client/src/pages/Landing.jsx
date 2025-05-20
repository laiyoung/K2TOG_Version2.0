import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import heroImg from '../images/hero-img.jpg';
import whoImg from '../images/whoImg.jpeg';
import whatImg from '../images/whatImg.jpeg';

function Landing() {
    return (
        <div className="bg-white min-h-screen font-montserrat">
            {/* Hero Section */}
            <section className="relative w-full h-[620px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-6" style={{ margin: '10px auto' }}>
                <img src={heroImg} alt="Hero" className="absolute inset-0 w-full h-full object-cover object-center z-0" />
                <div className="absolute inset-0 bg-black opacity-30 z-10" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                    <h1 className="hero-title font-normal mb-4" style={{ fontSize: '64px', fontFamily: 'Montserrat, sans-serif' }}>Grow your business.</h1>
                    <h3 className="hero-txt mb-8 max-w-2xl mx-auto" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Give your business a boost with a beautifully crafted homepage.</h3>
                    <Link to="#" className="hero-button bg-white text-black px-8 py-4 font-normal border-0 hover:bg-gray-100 transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}>LEARN MORE</Link>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Belief Statement */}
            <section id="statement-container" className="text-center px-6" style={{ margin: '150px auto', maxWidth: '1200px' }}>
                <p id="statement-title" className="uppercase tracking-widest mb-2" style={{ color: '#979797', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>WHAT WE BELIEVE IN</p>
                <p id="statement-text" className="mb-2" style={{ color: 'black', fontSize: '34px', fontFamily: 'Montserrat, sans-serif' }}>Grow your business, establish your brand, and put children first.</p>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Who we are */}
            <section className="py-16 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-8">
                <div className="flex-1 text-left">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900" style={{ fontSize: '28px', fontFamily: 'Montserrat, sans-serif' }}>Who we are</h3>
                    <p className="text-gray-700 mb-8" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>Nulla vel sodales tellus, quis condimentum enim. Nunc porttitor venenatis feugiat. Etiam quis faucibus erat, non accumsan leo. Aliquam erat volutpat. Vestibulum ac faucibus eros. Cras ullamcorper gravida tellus ut consequat.</p>
                    <Link to="#" className="bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}>LEARN MORE</Link>
                </div>
                <img src={whoImg} alt="Who we are" className="flex-1 w-full max-w-[500px] h-[350px] object-cover" />
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* What we do */}
            <section className="py-16 max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 px-8">
                <div className="flex-1 text-left">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900" style={{ fontSize: '28px', fontFamily: 'Montserrat, sans-serif' }}>What we do</h3>
                    <p className="text-gray-700 mb-8" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>Nulla vel sodales tellus, quis condimentum enim. Nunc porttitor venenatis feugiat. Etiam quis faucibus erat, non accumsan leo. Aliquam erat volutpat. Vestibulum ac faucibus eros. Cras ullamcorper gravida tellus ut consequat.</p>
                    <Link to="#" className="bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}>LEARN MORE</Link>
                </div>
                <img src={whatImg} alt="What we do" className="flex-1 w-full max-w-[500px] h-[350px] object-cover" />
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Call to Action */}
            <section className="bg-gray-100 py-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-semibold mb-4 text-gray-900" style={{ fontSize: '34px', fontFamily: 'Montserrat, sans-serif' }}>Grow your business.</h2>
                    <p className="mb-8 text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>Today is the day to build the business of your dreams. Share your mission with the world — and blow your customers away.</p>
                    <button className="bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}>START NOW</button>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default Landing; 