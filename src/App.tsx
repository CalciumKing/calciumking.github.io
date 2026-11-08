import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';

export default function App() {
    const { pathname } = useLocation();
    return (
        <>
            <Navigation />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {pathname !== '/' && pathname !== '/projects' && <Footer />}
        </>
    );
}
