import { Link } from 'react-router-dom';

function HeroSection() {
    return (
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[620px] mt-[30px] sm:mt-[40px] md:mt-[50px] lg:mt-[60px] mb-[30px] sm:mb-[40px] md:mb-[50px] lg:mb-[60px] flex flex-col justify-center items-center text-white text-center overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: 'url("/images/hero-img.jpg")',
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-4">
                    Unleash Your Child's Potential
                </h1>
                <h3 className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                    Give your child a bright, joyful, and creative start with our engaging programs and loving staff.
                </h3>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center items-center px-4">
                    <Link
                        to="/enroll"
                        className="bg-teal-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-teal-600 transition-colors inline-block font-semibold text-sm sm:text-base w-full sm:w-auto text-center"
                    >
                        Enroll Now
                    </Link>
                    <Link
                        to="/about"
                        className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-white/10 transition-all inline-block font-semibold text-sm sm:text-base w-full sm:w-auto text-center"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HeroSection; 