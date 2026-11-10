import { usePage } from '../hooks/usePage';
import AboutStage from '../sections/About/AboutStage/AboutStage';

export default function About() {
	usePage('About');
	return <AboutStage/>;
}
