import HeroComputationStage from '../sections/HeroComputationStage/HeroComputationStage';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Home() {
    useInfiniteScroll(!useReducedMotion());
    return <HeroComputationStage />;
}
