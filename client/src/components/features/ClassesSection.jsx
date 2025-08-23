import { Link } from 'react-router-dom';

const FEATURED_CLASSES = [
    {
        id: 1,
        title: "Arts And Crafts Bonanza",
        description: "Our arts and crafts activities inspire young minds to explore various artistic mediums, from painting and drawing to sculpting and collage-making.",
        imageUrl: "/images/arts-crafts.jpg",
        bgColor: "bg-emerald-400",
        duration: "12 weeks",
        category: "Arts & Creativity"
    },
    {
        id: 2,
        title: "Science And Experiments",
        description: "In our program, children don their lab coats and embark on exciting experiments.",
        imageUrl: "/images/science.jpg",
        bgColor: "bg-lime-200",
        duration: "10 weeks",
        category: "Science & Discovery"
    },
    {
        id: 3,
        title: "Sports Adventures",
        description: "Your child will have a blast while improving their coordination, balance, and teamwork skills",
        imageUrl: "/images/sports.jpg",
        bgColor: "bg-yellow-100",
        duration: "8 weeks",
        category: "Physical Activity"
    },
    {
        id: 4,
        title: "Nature Explorers",
        description: "From bug hunting and birdwatching to gardening and nature scavenger hunts, your child will develop a deep appreciation for the environment.",
        imageUrl: "/images/nature.jpg",
        bgColor: "bg-blue-400",
        duration: "12 weeks",
        category: "Outdoor Learning"
    }
];

function ClassesSection() {
    return (
        <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#ebfaf7]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
                        Our Activities Inside Gigglio
                    </h2>
                    <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto px-4">
                        Gigglio offers a variety of engaging and educational activities designed to spark creativity, curiosity, and joy in young minds.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {FEATURED_CLASSES.map(classItem => (
                        <div
                            key={classItem.id}
                            className={`${classItem.bgColor} rounded-[1rem] sm:rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden`}
                        >
                            {classItem.imageUrl && (
                                <div className="relative">
                                    <div className="p-3 sm:p-4 pb-0">
                                        <div className="rounded-[0.75rem] sm:rounded-[1rem] lg:rounded-[1.5rem] overflow-hidden">
                                            <img
                                                src={classItem.imageUrl}
                                                alt={classItem.title}
                                                className="w-full h-48 sm:h-60 md:h-72 object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="p-4 sm:p-6 lg:p-8">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                                    {classItem.title}
                                </h3>
                                <p className="text-gray-800 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                                    {classItem.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-900 font-semibold text-sm sm:text-base">Duration:</span>
                                        <span className="text-gray-800 text-sm sm:text-base">{classItem.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-900 font-semibold text-sm sm:text-base">{classItem.ageGroup}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/activities/${classItem.id}`}
                                    className="inline-flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 text-gray-900 font-semibold hover:bg-opacity-90 transition-opacity text-sm sm:text-base"
                                >
                                    More Details <span className="ml-2">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ClassesSection; 