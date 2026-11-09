import type { ReactNode } from 'react';
import styles from './ComputationSection.module.css';

type SectionProps = {
    className?: string;
    visual?: ReactNode; // only supplied in reduced-motion mode
};

export default function ComputationSection({ className, visual }: SectionProps) {
    return (
        <section
            className={className ? `${styles.section} ${className}` : styles.section}
            aria-labelledby="computation-title"
        >
            <div className={styles.inner}>
                <div className={styles.content}>
                    <p className={styles.label}>// MINDSET</p>
                    <h2 id="computation-title" className={styles.title}>
                        Understand Before Building
                    </h2>
                    <p className={styles.statement}>
                        Good engineering starts with comprehension. I enjoy looking beyond the surface, questioning assumptions, and understanding the systems behind the things we use.
                    </p>
                </div>

                <div className={styles.visual} aria-hidden="true">
                    {visual}
                </div>
            </div>
        </section>
    );
}
