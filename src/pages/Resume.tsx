import { usePage } from '../hooks/usePage';
import ResumeStage from '../sections/Resume/Stage/ResumeStage';

export default function Resume() {
	usePage('Resume');
	return <ResumeStage/>;
}
