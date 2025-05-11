import { Link } from 'react-router-dom';

function ActivityCard({ title, description, imageUrl, bgColor = 'bg-emerald-400', to = '#' }) {
    return (
        <div className={`${bgColor} rounded-3xl p-6 md:p-8 h-full`}>
            {imageUrl && (
                <div className="mb-6">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-64 object-cover rounded-2xl"
                    />
                </div>
            )}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {title}
            </h3>
            <p className="text-gray-800 mb-6 text-lg">
                {description}
            </p>
            <Link
                to={to}
                className="inline-flex items-center text-gray-900 font-semibold hover:opacity-80 transition-opacity"
            >
                Let's talk <span className="ml-2">→</span>
            </Link>
        </div>
    );
}

export default ActivityCard; 