import { usePage } from '../hooks/usePage';
import ContactStage from '../sections/Contact/Stage/ContactStage';

export default function Contact() {
	usePage('Contact');
	return <ContactStage/>;
}
