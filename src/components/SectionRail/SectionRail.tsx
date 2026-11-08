import type { CSSProperties, RefObject } from 'react';
import styles from './SectionRail.module.css';

// Track progress (0..1) at which each section is fully established.
const SECTIONS = [
    { label: 'Hero', at: 0 },
    { label: 'Computation', at: 0.153 },
    { label: 'Intelligence', at: 0.375 },
    { label: 'Geometry', at: 0.55 },
    { label: 'Directory', at: 0.72 },
];

type Props = { trackRef: RefObject<HTMLElement> };

export default function SectionRail({ trackRef }: Props) {
    const goTo = (at: number) => {
        const track = trackRef.current;
        if (!track) return;
        const sticky = track.firstElementChild as HTMLElement | null;
        const range = track.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight);
        const top = track.getBoundingClientRect().top + window.scrollY + at * range;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    return (
        <nav className={styles.rail} aria-label="Page sections">
            <ul className={styles.list}>
                {SECTIONS.map(({ label, at }) => (
                    <li key={label}>
                        <button
                            type="button"
                            className={styles.button}
                            style={{ '--c': at } as CSSProperties}
                            aria-label={label}
                            onClick={() => goTo(at)}
                        >
                            <span className={styles.line} />
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
