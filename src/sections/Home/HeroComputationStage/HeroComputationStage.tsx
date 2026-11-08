import { useEffect, useRef, useState, type RefObject } from 'react';
import DirectorySection from '../Directory/DirectorySection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import type { SceneHandle } from '../../../hooks/useThreeScene';
import HeroSection from '../Hero/HeroSection';
import ComputationSection from '../Computation/ComputationSection';
import {createStageScene, STAGE_PROGRESS, StageLayout} from './StageScene';
import styles from './HeroComputationStage.module.css';
import IntelligenceSection from '../Intelligence/IntelligenceSection';
import GeometrySection from '../Geometry/GeometrySection';
import SectionRail from '../../../components/SectionRail/SectionRail';
import Footer from '../../../components/Footer/Footer';

type Progress = { current: number };
const HERO: Progress = { current: STAGE_PROGRESS.hero };
const CPU: Progress = { current: STAGE_PROGRESS.computation };
const NETWORK: Progress = { current: STAGE_PROGRESS.intelligence };
const GEOMETRY: Progress = { current: STAGE_PROGRESS.geometry };

type CanvasProps = {
    progress: Progress;
    layout: StageLayout;
    reducedMotion: boolean;
    className: string;
    tree?: RefObject<HTMLElement>; // directory tree element the scene measures (stage layout only)
};

function StageCanvas({ progress, layout, reducedMotion, className, tree }: CanvasProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;
        let handle: SceneHandle | null = null;
        try {
            handle = createStageScene(container, { reducedMotion, layout, progress, tree });
            setFailed(false);
        } catch (error) {
            console.warn('Three.js scene failed to initialize:', error);
            setFailed(true);
        }
        return () => handle?.dispose();
    }, [progress, layout, reducedMotion, tree]);

    return (
        <>
            <div ref={ref} className={className} />
            {failed && <p className={styles.fallback}>3D visualization unavailable</p>}
        </>
    );
}

export default function HeroComputationStage() {
    const reducedMotion = useReducedMotion();
    const trackRef = useRef<HTMLDivElement>(null);
    const treeRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [directoryActive, setDirectoryActive] = useState(false);
    const progress = useScrollProgress(trackRef, !reducedMotion);

    // The directory's links are only reachable (hidden → visible) once its phase is well under way.
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || reducedMotion) return;
        const observer = new IntersectionObserver(([entry]) => setDirectoryActive(entry.isIntersecting), {
            rootMargin: '-50% 0px -50% 0px',
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [reducedMotion]);

    // Reduced motion: two ordinary stacked sections, each with a static render.
    if (reducedMotion) {
        return (
            <>
                <HeroSection
                    visual={<StageCanvas progress={HERO} layout="inline" reducedMotion className={styles.inlineCanvas} />}
                />
                <ComputationSection
                    visual={<StageCanvas progress={CPU} layout="inline" reducedMotion className={styles.inlineCanvas} />}
                />
                <IntelligenceSection
                    visual={<StageCanvas progress={NETWORK} layout="inline" reducedMotion className={styles.inlineCanvas} />}
                />
                <GeometrySection
                    visual={<StageCanvas progress={GEOMETRY} layout="inline" reducedMotion className={styles.inlineCanvas} />}
                />
                <DirectorySection />
                <Footer />
            </>
        );
    }

    return (
        <div ref={trackRef} className={styles.track}>
            <div className={styles.sticky}>
                <StageCanvas progress={progress} layout="stage" reducedMotion={false} className={styles.canvas} tree={treeRef} />
                <div className={`${styles.layer} ${styles.heroLayer}`}>
                    <HeroSection />
                </div>
                <div className={`${styles.layer} ${styles.computationLayer}`}>
                    <ComputationSection />
                </div>
                <div className={`${styles.layer} ${styles.intelligenceLayer}`}>
                    <IntelligenceSection />
                </div>
                <div className={`${styles.layer} ${styles.geometryLayer}`}>
                    <GeometrySection />
                </div>
                <div
                    className={`${styles.layer} ${styles.directoryLayer}${directoryActive ? ` ${styles.directoryActive}` : ''}`}
                >
                    <DirectorySection treeRef={treeRef} />
                    <div className={styles.footerSlot}>
                        <Footer />
                    </div>
                </div>
                <SectionRail trackRef={trackRef} />
            </div>
            <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
        </div>
    );
}
