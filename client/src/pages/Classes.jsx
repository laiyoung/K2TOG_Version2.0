import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Import images at the top
import class1 from '../images/class-1.jpg';
import class2 from '../images/class-2.jpg';
import class3 from '../images/class-3.jpg';

const classes = [
    {
        id: 1,
        title: 'Child Development Associate (CDA)',
        description: 'This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. Learn about child development, curriculum planning, and professional practices. Perfect for those seeking to advance their career in early childhood education.',
        image: class1,
        price: 299.99,
        location: 'Online',
        duration: '12 weeks'
    },
    {
        id: 2,
        title: 'Development and Operations',
        description: 'Master the essential skills needed to run a successful childcare program. Learn about business operations, staff management, curriculum development, and regulatory compliance. This course is ideal for current and aspiring childcare center directors.',
        image: class2,
        price: 349.99,
        location: 'In-Person',
        duration: '8 weeks'
    },
    {
        id: 3,
        title: 'CPR and First Aid Certification',
        description: 'Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This course meets state licensing requirements and provides certification valid for two years.',
        image: class3,
        price: 149.99,
        location: 'Hybrid',
        duration: '2 days'
    }
];

function Classes() {
    return (
        <div className="bg-white min-h-screen font-montserrat">
            <Header />

            {/* Hero Section */}
            <section className="relative w-full h-[400px] flex items-center justify-center text-white text-center overflow-hidden mb-0 px-6" style={{ margin: '10px auto' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 z-0" />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                    <h1 className="text-4xl md:text-5xl font-normal mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Classes</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90" style={{ fontFamily: 'Montserrat, sans-serif' }}>Professional development courses for childcare providers</p>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-0" />

            {/* Classes List */}
            <div className="max-w-6xl mx-auto space-y-20 mb-20 px-6">
                {classes.map((classItem, index) => (
                    <div key={classItem.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
                        <div className="flex-1 text-left">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900" style={{ fontSize: '28px', fontFamily: 'Montserrat, sans-serif' }}>{classItem.title}</h2>
                            <p className="text-gray-700 mb-4" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>{classItem.description}</p>
                            <div className="mb-8 space-y-2">
                                <p className="text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>
                                    <span className="font-medium">Duration:</span> {classItem.duration}
                                </p>
                                <p className="text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>
                                    <span className="font-medium">Location:</span> {classItem.location}
                                </p>
                                <p className="text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>
                                    <span className="font-medium">Price:</span> ${classItem.price}
                                </p>
                            </div>
                            <Link
                                to={`/classes/${classItem.id}`}
                                className="inline-block bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}
                            >
                                VIEW DETAILS
                            </Link>
                        </div>
                        <img
                            src={classItem.image}
                            alt={classItem.title}
                            className="flex-1 w-full max-w-[500px] h-[350px] object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <section className="bg-gray-100 py-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-semibold mb-4 text-gray-900" style={{ fontSize: '34px', fontFamily: 'Montserrat, sans-serif' }}>Ready to Advance Your Career?</h2>
                    <p className="mb-8 text-gray-700" style={{ fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>Take the next step in your professional development with our comprehensive childcare training programs.</p>
                    <Link
                        to="/contact"
                        className="inline-block bg-black text-white px-8 py-4 font-normal border-0 hover:bg-gray-900 transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '16px' }}
                    >
                        CONTACT US
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Classes; 