import ProjectsHero from '../sections/Projects/Hero/ProjectsHero';
import ProjectSequence from '../sections/Projects/ProjectSequence/ProjectSequence';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Projects() {
    useInfiniteScroll(!useReducedMotion());
    return (
        <>
            <ProjectsHero />
            <ProjectSequence />
        </>
    );
}
