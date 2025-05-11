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
        <section className="w-full py-16 px-6 bg-[#ebfaf7]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Our Activities Inside Gigglio
                    </h2>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                        Gigglio offers a variety of engaging and educational activities designed to spark creativity, curiosity, and joy in young minds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {FEATURED_CLASSES.map(classItem => (
                        <div
                            key={classItem.id}
                            className={`${classItem.bgColor} rounded-[2rem] overflow-hidden`}
                        >
                            {classItem.imageUrl && (
                                <div className="relative">
                                    <div className="p-4 pb-0">
                                        <div className="rounded-[1.5rem] overflow-hidden">
                                            <img
                                                src={classItem.imageUrl}
                                                alt={classItem.title}
                                                className="w-full h-72 object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="p-8">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                    {classItem.title}
                                </h3>
                                <p className="text-gray-800 mb-6 text-lg">
                                    {classItem.description}
                                </p>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-900 font-semibold">Duration:</span>
                                        <span className="text-gray-800">{classItem.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-900 font-semibold">{classItem.ageGroup}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/activities/${classItem.id}`}
                                    className="inline-flex items-center bg-white rounded-full px-6 py-3 text-gray-900 font-semibold hover:bg-opacity-90 transition-opacity"
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