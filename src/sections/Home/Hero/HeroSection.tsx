import type { ReactNode } from 'react';
import styles from './HeroSection.module.css';

type SectionProps = {
    className?: string;
    visual?: ReactNode; // only supplied in reduced-motion mode
};

export default function HeroSection({ className, visual }: SectionProps) {
    return (
        <section
            className={className ? `${styles.hero} ${className}` : styles.hero}
            aria-labelledby="hero-title"
        >
            <div className={styles.inner}>
                <div className={styles.content}>
                    <p className={styles.role}>// SOFTWARE ENGINEER</p>
                    <h1 id="hero-title" className={styles.name}>
                        <span>Landen</span> <span>Ingerslev</span>
                    </h1>
                    <p className={styles.statement}>
                        Working across disciplines. Driven by curiosity. Focused on building things that matter.
                    </p>
                </div>

                <div className={styles.visual} aria-hidden="true">
                    {visual}
                </div>
            </div>

            <div className={styles.scroll} aria-hidden="true">
                <span className={styles.scrollLabel}>SCROLL</span>
                <span className={styles.scrollLine} />
            </div>
        </section>
    );
}
