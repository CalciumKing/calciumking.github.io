import ScrollHint from '../../../components/ScrollHint/ScrollHint';
import ThreeCanvas from '../../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useProjectsUi } from '../projectsContent';
import { createProjectsHeroScene } from './heroScene';
import styles from './ProjectsHero.module.css';

export default function ProjectsHero() {
	const { hero } = useProjectsUi()
	const reducedMotion = useReducedMotion();
	
	return (
		<section className={ styles.hero }>
			<div className={ styles.text }>
				<p className={ styles.eyebrow }>{hero.eyebrow}</p>
				<h1 className={ styles.title }>{hero.title}</h1>
				<p className={ styles.description }>
					{hero.description}
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
