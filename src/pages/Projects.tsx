import ProjectsHero from '../sections/Projects/Hero/ProjectsHero';
import ProjectSequence from '../sections/Projects/ProjectSequence/ProjectSequence';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import {useDocumentTitle} from "../hooks/useDocumentTitle";

export default function Projects() {
    useInfiniteScroll(!useReducedMotion());
    useDocumentTitle("Projects | Calcium King")
    return (
        <>
            <ProjectsHero />
            <ProjectSequence />
        </>
    );
}
