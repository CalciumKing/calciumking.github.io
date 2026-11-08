import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useThreeScene } from '../../../hooks/useThreeScene';
import { createProjectsHeroScene } from './heroScene';
import styles from './ProjectsHero.module.css';

export default function ProjectsHero() {
    const reducedMotion = useReducedMotion();
    const { containerRef, failed } = useThreeScene(createProjectsHeroScene, reducedMotion);

    return (
        <section className={styles.hero}>
            <div className={styles.text}>
                <p className={styles.eyebrow}>PROJECTS</p>
                <h1 className={styles.title}>Selected Work</h1>
                <p className={styles.description}>
                    A collection of engineering, software, and independent development work.
                </p>
            </div>
            <div className={styles.visual} aria-hidden="true">
                <div ref={containerRef} className={styles.canvas} />
                {failed && <p className={styles.fallback}>3D visualization unavailable</p>}
            </div>
            <div className={styles.scroll} aria-hidden="true">
                <span className={styles.scrollLabel}>SCROLL</span>
                <span className={styles.scrollLine} />
            </div>
        </section>
    );
}
