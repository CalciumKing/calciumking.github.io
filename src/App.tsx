import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Splash from './components/Splash/Splash';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Projects from './pages/Projects';

export default function App() {
	return (
		<>
			<ScrollToTop/>
			<Splash/>
			<Navigation/>
			<main>
				<Routes>
					<Route path="/" element={ <Home/> }/>
					<Route path="/projects" element={ <Projects/> }/>
					<Route path="/about" element={ <About/> }/>
					<Route path="/contact" element={ <Contact/> }/>
					<Route path="*" element={ <Navigate to="/" replace/> }/>
				</Routes>
			</main>
		</>
	);
}
