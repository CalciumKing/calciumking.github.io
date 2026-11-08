import AboutStage from '../sections/About/AboutStage/AboutStage';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import {useDocumentTitle} from "../hooks/useDocumentTitle";

export default function About() {
    useInfiniteScroll(!useReducedMotion());
    useDocumentTitle("About | Calcium King")
    return <AboutStage />;
}
