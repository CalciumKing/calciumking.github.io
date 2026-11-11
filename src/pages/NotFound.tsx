import Footer from '../components/Footer/Footer';
import { usePage } from '../hooks/usePage';
import NotFoundSection from '../sections/NotFound/NotFoundSection';

export default function NotFound() {
	usePage('404', false);
	return (
		<>
			<NotFoundSection/>
			<Footer/>
		</>
	);
}
