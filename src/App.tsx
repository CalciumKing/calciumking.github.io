import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';

export default function App() {
    const { pathname } = useLocation();
    return (
        <>
            <Navigation />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* Routes for /about, /projects, /resume, /contact are added here later. */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {pathname !== '/' && <Footer />}
        </>
    );
}
