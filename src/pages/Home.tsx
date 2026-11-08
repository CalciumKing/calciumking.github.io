import HeroComputationStage from '../sections/Home/HeroComputationStage/HeroComputationStage';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Home() {
    useInfiniteScroll(!useReducedMotion());
    return <HeroComputationStage />;
}
