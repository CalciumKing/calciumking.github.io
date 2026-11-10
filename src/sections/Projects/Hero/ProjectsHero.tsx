import ScrollHint from '../../../components/ScrollHint/ScrollHint';
import ThreeCanvas from '../../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { createProjectsHeroScene } from './heroScene';
import styles from './ProjectsHero.module.css';

export default function ProjectsHero() {
	const reducedMotion = useReducedMotion();
	
	return (
		<section className={ styles.hero }>
			<div className={ styles.text }>
				<p className={ styles.eyebrow }>/PROJECTS</p>
				<h1 className={ styles.title }>Selected Work</h1>
				<p className={ styles.description }>
					A collection of engineering, software, and independent development work.
				</p>
			</div>
			<div className={ styles.visual } aria-hidden="true">
				<ThreeCanvas factory={ createProjectsHeroScene } reducedMotion={ reducedMotion }
				             className={ styles.canvas }/>
			</div>
			<ScrollHint/>
		</section>
	);
}
