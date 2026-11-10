import { usePage } from '../hooks/usePage';
import HomeStage from '../sections/Home/Stage/HomeStage';

export default function Home() {
	usePage('Home');
	return <HomeStage/>;
}
