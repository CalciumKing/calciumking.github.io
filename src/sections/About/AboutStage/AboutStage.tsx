import { useCallback, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import SectionRail from '../../../components/SectionRail/SectionRail';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import type {SceneFactory} from '../../../hooks/useThreeScene';
import { PHASES, type Phase } from '../aboutContent';
import { createMachineScene } from '../machine/createMachine';
import styles from './AboutStage.module.css';
import Footer from '../../../components/Footer/Footer';
import ThreeCanvas from "../../../components/ThreeCanvas/ThreeCanvas";
import ScrollHint from "../../../components/ScrollHint/ScrollHint";
import { useProgressRange } from "../../../hooks/useProgressRange";
import PinnedTrack from "../../../components/PinnedTrack/PinnedTrack";

type Progress = { current: number };
const RAIL = PHASES.map(({ label, at }) => ({ label, at }));
const STATIC: Progress[] = PHASES.map((p) => ({ current: p.at }));

type CanvasProps = {
    progress: Progress;
    reducedMotion: boolean;
    className: string;
};

function MachineCanvas({ progress, reducedMotion, className }: CanvasProps) {
    const factory = useCallback<SceneFactory>(
        (container, options) => createMachineScene(container, { ...options, progress }),
        [progress],
    );
    return <ThreeCanvas factory={factory} reducedMotion={reducedMotion} className={className} />;
}

function PhaseBody({ phase, interactive }: { phase: Phase; interactive: boolean }) {
    const isHero = phase.id === 'identity';
    const Heading = isHero ? 'h1' : 'h2';

    return (
        <div className={styles.panel}>
            <p className={styles.eyebrow}>{phase.eyebrow}</p>
            <Heading className={isHero ? styles.title : styles.heading}>{phase.heading}</Heading>
            {phase.body && <p className={styles.body}>{phase.body}</p>}
            {phase.items && (
                <ul className={styles.items}>
                    {phase.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
            {phase.groups && (
                <div className={styles.groups}>
                    {phase.groups.map((g) => (
                        <div key={g.label}>
                            <p className={styles.eyebrow}>{g.label}</p>
                            <p className={styles.groupItems}>{g.items.join(' · ')}</p>
                        </div>
                    ))}
                </div>
            )}
            {phase.links && (
                <div className={styles.links}>
                    {phase.links.map((l) => (
                        <Link key={l.to} to={l.to} className={styles.link} tabIndex={interactive ? 0 : -1}>
                            {l.label} →
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AboutStage() {
    const reducedMotion = useReducedMotion();
    const trackRef = useRef<HTMLDivElement>(null);
    const progress = useScrollProgress(trackRef, !reducedMotion);
    const end = useProgressRange(progress, 0.8, 0.96, !reducedMotion);

    if (reducedMotion) {
        return (
            <>
                {PHASES.map((phase, i) => (
                    <section key={phase.id} className={`${styles.block} ${styles[phase.side]}`}>
                        <PhaseBody phase={phase} interactive />
                        <div className={styles.inlineWrap}>
                            <MachineCanvas progress={STATIC[i]} reducedMotion className={styles.inline} />
                        </div>
                    </section>
                ))}
                <Footer />
            </>
        );
    }

    return (
        <PinnedTrack trackRef={trackRef} height="1200svh">
                <MachineCanvas progress={progress} reducedMotion={false} className={styles.canvas} />
                {PHASES.map((phase) => {
                    const cls = [
                        styles.layer,
                        phase.id === 'identity' && styles.layerHero,
                        phase.side === 'center' && styles.layerEnd,
                        phase.id === 'conclusion' && end && styles.active,
                    ]
                        .filter(Boolean)
                        .join(' ');
                    return (
                        <div key={phase.id} className={cls} style={{ '--a': phase.at } as CSSProperties}>
                            <div className={`${styles.inner} ${styles[phase.side]}`}>
                                <PhaseBody phase={phase} interactive={phase.id !== 'conclusion' || end} />
                            </div>
                            {phase.id === 'identity' && <ScrollHint />}
                        </div>
                    );
                })}
                <div className={styles.footerSlot}>
                    <Footer />
                </div>
                <SectionRail trackRef={trackRef} sections={RAIL} loop={false} />
        </PinnedTrack>
    );
}
