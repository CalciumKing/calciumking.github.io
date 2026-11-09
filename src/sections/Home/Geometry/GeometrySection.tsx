import type { ReactNode } from 'react';
import styles from './GeometrySection.module.css';

type SectionProps = {
    className?: string;
    visual?: ReactNode; // only supplied in reduced-motion mode
};

export default function GeometrySection({ className, visual }: SectionProps) {
    return (
        <section
            className={className ? `${styles.section} ${className}` : styles.section}
            aria-labelledby="geometry-title"
        >
            <div className={styles.inner}>
                <div className={styles.content}>
                    <p className={styles.label}>// PERSPECTIVE</p>
                    <h2 id="geometry-title" className={styles.title}>
                        Think Beyond Convention
                    </h2>
                    <p className={styles.statement}>
                        Possibilities emerge in challenging the model. I try to approach problems from different perspectives, and using ideas that challenge familiar ways of thinking.
                    </p>
                </div>

                <div className={styles.visual} aria-hidden="true">
                    {visual}
                </div>
            </div>
        </section>
    );
}
