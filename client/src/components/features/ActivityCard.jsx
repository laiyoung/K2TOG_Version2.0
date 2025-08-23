import { Link } from 'react-router-dom';

function ActivityCard({ title, description, imageUrl, bgColor = 'bg-emerald-400', to = '#' }) {
    return (
        <div className={`${bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 h-full`}>
            {imageUrl && (
                <div className="mb-4 sm:mb-6">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl sm:rounded-2xl"
                    />
                </div>
            )}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                {title}
            </h3>
            <p className="text-gray-800 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                {description}
            </p>
            <Link
                to={to}
                className="inline-flex items-center text-gray-900 font-semibold hover:opacity-80 transition-opacity text-sm sm:text-base"
            >
                Let's talk <span className="ml-2">→</span>
            </Link>
        </div>
    );
}

export default ActivityCard; 