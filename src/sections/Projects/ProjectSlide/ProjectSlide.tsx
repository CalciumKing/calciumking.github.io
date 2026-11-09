import { useEffect, useRef, useState } from 'react';
import type { Project } from '../projectsContent';
import ThreeCanvas from "../../../components/ThreeCanvas/ThreeCanvas";
import styles from './ProjectSlide.module.css';

type Props = {
    project: Project;
    stacked: boolean;
    reducedMotion: boolean;
    active?: boolean; // stage mode: only the active slide is focusable/clickable
    near?: boolean; // stage mode: mount the scene only near the foreground
};

export default function ProjectSlide({ project, stacked, reducedMotion, active = true, near = true }: Props) {
    const rootRef = useRef<HTMLElement>(null);
    const visualRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        rootRef.current?.toggleAttribute('inert', !active);
    }, [active]);

    // Stacked mode: mount the scene only while its frame is near the viewport.
    useEffect(() => {
        const el = visualRef.current;
        if (!stacked || !el) return;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
            rootMargin: '50% 0px',
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [stacked]);

    const { tagline, name, description, role, technologies, githubUrl, liveUrl, scene } = project;
    const mountScene = stacked ? visible : near;

    return (
        <article
            ref={rootRef}
            className={`${styles.slide}${stacked ? ` ${styles.stacked}` : ''}`}
            data-active={active}
            aria-hidden={active ? undefined : true}
        >
            <div ref={visualRef} className={styles.visual} aria-hidden="true">
                {scene && mountScene && <ThreeCanvas factory={scene} reducedMotion={reducedMotion} className={styles.scene} />}
            </div>

            <div className={styles.info}>
                <p className={styles.eyebrow}>// {tagline}</p>
                <h2 className={styles.name}>{name}</h2>
                <p className={styles.description}>{description}</p>

                {(role || technologies.length > 0) && (
                    <dl className={styles.meta}>
                        {role && (
                            <div>
                                <dt className={styles.label}>ROLE</dt>
                                <dd className={styles.value}>{role}</dd>
                            </div>
                        )}
                        {technologies.length > 0 && (
                            <div>
                                <dt className={styles.label}>TECHNOLOGIES</dt>
                                <dd className={styles.value}>{technologies.join(' · ')}</dd>
                            </div>
                        )}
                    </dl>
                )}

                {(githubUrl || liveUrl) && (
                    <div className={styles.links}>
                        {githubUrl && (
                            <a className={styles.link} href={githubUrl} target="_blank" rel="noopener noreferrer">
                                GITHUB ↗
                            </a>
                        )}
                        {liveUrl && (
                            <a className={styles.link} href={liveUrl} target="_blank" rel="noopener noreferrer">
                                LIVE PROJECT ↗
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
