import ProjectsHero from '../sections/Projects/Hero/ProjectsHero';
import ProjectSequence from '../sections/Projects/ProjectSequence/ProjectSequence';
import {MOBILE_QUERY} from "../lib/layout";
import {useMediaQuery} from "../hooks/useMediaQuery";
import {usePage} from "../hooks/usePage";

export default function Projects() {
    const narrow = useMediaQuery(MOBILE_QUERY); // stacked layout has no matching end state
    usePage('Projects', !narrow);
    return (
        <>
            <ProjectsHero />
            <ProjectSequence />
        </>
    );
}
