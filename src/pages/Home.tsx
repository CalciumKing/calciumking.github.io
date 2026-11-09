import HomeStage from '../sections/Home/Stage/HomeStage';
import {usePage} from "../hooks/usePage";

export default function Home() {
    usePage('Home')
    return <HomeStage />;
}
