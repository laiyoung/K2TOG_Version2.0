import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="w-full bg-white font-montserrat px-6 py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <div className="h-[120px] w-[400px] overflow-hidden">
                        <img
                            src="/images/logo-img.png"
                            alt="YJ Child Care Plus Inc."
                            className="h-full w-full object-contain scale-125"
                        />
                    </div>
                </Link>
                <nav className="flex items-center space-x-8">
                    <Link to="/" className="nav-button uppercase text-gray-500 hover:text-black transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}>About</Link>
                    <Link to="/classes" className="nav-button uppercase text-gray-500 hover:text-black transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}>Classes</Link>
                    <Link to="#" className="nav-button uppercase text-gray-500 hover:text-black transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}>Resourses</Link>
                    <Link to="/contact" className="nav-button uppercase text-gray-500 hover:text-black transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}>Contact</Link>
                    <Link
                        to="/login"
                        className="nav-button uppercase text-gray-500 hover:text-black transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '14px', padding: '12px 16px' }}
                    >
                        Login
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header; 