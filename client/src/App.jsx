import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Classes from './pages/Classes';
import UserAccount from './pages/UserAccount';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import ClassDetails from './pages/ClassDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './components/profile/ProfilePage';
import './App.css';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <main>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/classes" element={<Classes />} />
                        <Route path="/classes/:id" element={<ClassDetails />} />
                        <Route path="/account" element={<UserAccount />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;