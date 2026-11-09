import type { ReactNode } from 'react';
import styles from './IntelligenceSection.module.css';

type SectionProps = {
    className?: string;
    visual?: ReactNode; // only supplied in reduced-motion mode
};

export default function IntelligenceSection({ className, visual }: SectionProps) {
    return (
        <section
            className={className ? `${styles.section} ${className}` : styles.section}
            aria-labelledby="intelligence-title"
        >
            <div className={styles.inner}>
                <div className={styles.content}>
                    <p className={styles.label}>// CURIOSITY</p>
                    <h2 id="intelligence-title" className={styles.title}>
                        Intelligence Through Connection
                    </h2>
                    <p className={styles.statement}>
                        The unknown is the frontier of knowledge. I'm drawn to unfamiliar ideas, difficult questions, and unique perspectives.
                    </p>
                </div>

                <div className={styles.visual} aria-hidden="true">
                    {visual}
                </div>
            </div>
        </section>
    );
}
