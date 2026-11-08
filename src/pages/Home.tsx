import HeroComputationStage from '../sections/Home/HeroComputationStage/HeroComputationStage';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import {useDocumentTitle} from "../hooks/useDocumentTitle";

export default function Home() {
    useInfiniteScroll(!useReducedMotion());
    useDocumentTitle("Home | Calcium King")
    return <HeroComputationStage />;
}
