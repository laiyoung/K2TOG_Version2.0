import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="w-full bg-white font-montserrat border-t border-gray-200 mt-24 pt-12 pb-4 text-[#222] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start px-6 gap-8 ml-24">
                <div className="mb-8 md:mb-0 flex flex-col items-start" style={{ minWidth: 220 }}>
                    <img
                        src="/images/logo-img.png"
                        alt="YJ Child Care Plus Inc."
                        className="h-[100px] w-[300px] object-cover object-left mb-4"
                    />
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="text-[#979797] text-xs mb-2 uppercase tracking-widest">Classes</div>
                        <div className="mb-1"><Link to="#" className="text-[#222] no-underline hover:underline">Development and Operations</Link></div>
                        <div className="mb-1"><Link to="#" className="text-[#222] no-underline hover:underline">CDA</Link></div>
                        <div className="mb-1"><Link to="#" className="text-[#222] no-underline hover:underline">CPR</Link></div>
                    </div>
                    <div>
                        <div className="text-[#979797] text-xs mb-2 uppercase tracking-widest">Resources</div>
                        <div className="mb-1"><Link to="#" className="text-[#222] no-underline hover:underline">Applications</Link></div>
                        <div className="mb-1"><Link to="#" className="text-[#222] no-underline hover:underline">Scholarships</Link></div>
                    </div>
                    <div>
                        <div className="text-[#979797] text-xs mb-2 uppercase tracking-widest">Subscribe</div>
                        <form className="flex mt-1">
                            <input type="email" placeholder="Enter email for updates" className="border border-gray-300 px-3 py-2 text-xs focus:outline-none" style={{ fontFamily: 'Montserrat, sans-serif' }} />
                            <button type="submit" className="bg-black text-white px-4 text-xs">→</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="w-full text-center text-[#979797] text-xs mt-8 pt-4 border-t border-gray-100">© 2022 YJ Child Care Plus Inc. All rights reserved</div>
        </footer>
    );
}

export default Footer; 