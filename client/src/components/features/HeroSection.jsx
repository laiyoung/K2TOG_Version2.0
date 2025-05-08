function HeroSection() {
    return (
        <section className="w-full bg-teal-200 py-12 flex flex-col md:flex-row items-center justify-center gap-8 px-6">
            <div className="flex-1 max-w-xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-teal-900">Unleash Your Child's Potential At YJ Child Care Plus</h2>
                <p className="mb-6 text-lg text-teal-800">Give your child a bright, joyful, and creative start with our engaging programs and loving staff.</p>
                <div className="space-x-4">
                    <button className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600">Enroll Now</button>
                    <button className="bg-white text-teal-700 border border-teal-500 px-6 py-2 rounded hover:bg-teal-100">Learn More</button>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 items-center">
                <div className="flex gap-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-lg" />
                    <div className="w-32 h-32 bg-gray-300 rounded-lg" />
                </div>
                <div className="w-32 h-32 bg-gray-300 rounded-lg" />
            </div>
        </section>
    );
}

export default HeroSection; 