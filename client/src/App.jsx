import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Classes from './pages/Classes';
import SingleClass from './pages/SingleClass';
import UserAccount from './pages/UserAccount';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<SingleClass />} />
            <Route path="/account" element={<UserAccount />} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}

export default App;