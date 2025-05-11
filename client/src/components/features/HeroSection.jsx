import { Link } from 'react-router-dom';

function HeroSection() {
    return (
        <div className="relative w-full h-[620px] mt-[60px] mb-[60px] flex flex-col justify-center items-center text-white text-center overflow-hidden">
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
            <div className="relative z-10 max-w-4xl px-6">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    Unleash Your Child's Potential
                </h1>
                <h3 className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                    Give your child a bright, joyful, and creative start with our engaging programs and loving staff.
                </h3>
                <div className="space-x-4">
                    <Link
                        to="/enroll"
                        className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition-colors inline-block font-semibold"
                    >
                        Enroll Now
                    </Link>
                    <Link
                        to="/about"
                        className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-all inline-block font-semibold"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HeroSection; 