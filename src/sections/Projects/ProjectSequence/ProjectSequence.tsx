import { type CSSProperties, useEffect, useRef, useState, useMemo } from 'react';
import Footer from '../../../components/Footer/Footer';
import SectionRail from '../../../components/SectionRail/SectionRail';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import { MOBILE_QUERY } from '../../../lib/layout';
import ProjectsHero from '../Hero/ProjectsHero';
import { PROJECT_COUNT, useProjects, useProjectsUi } from '../projectsContent';
import ProjectSlide from '../ProjectSlide/ProjectSlide';
import styles from './ProjectSequence.module.css';

const COUNT = PROJECT_COUNT;
const PROJECTS_SHARE = 0.75;

export default function ProjectSequence() {
	const reducedMotion = useReducedMotion();
	const narrow = useMediaQuery(MOBILE_QUERY);
	const stacked = reducedMotion || narrow;
	const trackRef = useRef<HTMLElement>(null);
	const progress = useScrollProgress(trackRef, !stacked);
	const [active, setActive] = useState(0);
	const [returning, setReturning] = useState(false);
	
	const PROJECTS = useProjects();
	const ui = useProjectsUi();
	const railSections = useMemo(
		() => PROJECTS.map((p, i) => ({ label: p.name, at: (i / (COUNT - 1)) * PROJECTS_SHARE })),
		[PROJECTS]
	);
	
	useEffect(() => {
		if (stacked) return;
		const update = () => {
			const s = Math.min(1, progress.current / PROJECTS_SHARE);
			const next = Math.round(s * (COUNT - 1));
			setActive((prev) => (prev === next ? prev : next));
			setReturning(progress.current > 0.8);
			
			const track = trackRef.current;
			if (track) {
				const top = track.getBoundingClientRect().top;
				const intro = Math.min(1, Math.max(0, top / (window.innerHeight * 0.5)));
				const outro = Math.min(1, Math.max(0, (progress.current - 0.92) / 0.07));
				track.style.setProperty('--hero', Math.max(intro, outro).toFixed(3));
			}
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, [stacked, progress]);
	
	if (stacked) {
		return (
			<>
				<section className={ styles.stacked } aria-label={ui.selected}>
					<ol className={ styles.list }>
						{ PROJECTS.map((project) => (
							<li key={ project.id }>
								<ProjectSlide project={ project } stacked reducedMotion={ reducedMotion }/>
							</li>
						)) }
					</ol>
				</section>
				<Footer/>
			</>
		);
	}
	
	return (
		<section
			ref={ trackRef }
			className={ styles.track }
			style={ { '--n': COUNT, '--share': PROJECTS_SHARE } as CSSProperties }
			aria-label={ui.selected}
		>
			<div className={ styles.sticky }>
				<ol className={ styles.stage }>
					{ PROJECTS.map((project, i) => (
						<li
							key={ project.id }
							className={ styles.item }
							style={ { '--i': i } as CSSProperties }
							data-far={ Math.abs(i - active) > 1 ? 'true' : undefined }
						>
							<ProjectSlide
								project={ project }
								stacked={ false }
								active={ i === active }
								near={ Math.abs(i - active) <= 1 }
								reducedMotion={ false }
							/>
						</li>
					)) }
				</ol>
				<div className={ styles.returnLayer } aria-hidden="true" hidden={ !returning }>
					<ProjectsHero/>
				</div>
				<div className={ styles.footerSlot }>
					<Footer/>
				</div>
			</div>
			<SectionRail trackRef={ trackRef } sections={ railSections } loop={ false } fixed leading={ui.leading}/>
		</section>
	);
}
