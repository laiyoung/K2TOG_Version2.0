import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="w-full px-6 py-4 bg-white">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-teal-700">
                    LOGO
                </Link>

                <nav className="flex items-center space-x-8">
                    <a href="#activities" className="text-gray-700 hover:text-teal-600 transition-colors">
                        Activities
                    </a>
                    <a href="#about" className="text-gray-700 hover:text-teal-600 transition-colors">
                        About
                    </a>
                    <a href="#teachers" className="text-gray-700 hover:text-teal-600 transition-colors">
                        Teachers
                    </a>
                    <a href="#contact" className="text-gray-700 hover:text-teal-600 transition-colors">
                        Contact
                    </a>
                </nav>

                <button className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors">
                    Contact Us
                </button>
            </div>
        </header>
    );
}

export default Header; 