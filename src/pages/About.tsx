import AboutStage from '../sections/About/AboutStage/AboutStage';
import {usePage} from "../hooks/usePage";

export default function About() {
    usePage('About')
    return <AboutStage />;
}
