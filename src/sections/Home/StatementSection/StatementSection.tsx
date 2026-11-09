import type { ReactNode } from 'react';
import styles from './StatementSection.module.css';

type Props = {
    id: string;
    label: string;
    title: string;
    statement: string;
    visualSide: 'left' | 'right';
    className?: string;
    visual?: ReactNode; // only supplied in reduced-motion mode
};

export default function StatementSection({ id, label, title, statement, visualSide, className, visual }: Props) {
    const cls = [styles.section, visualSide === 'left' && styles.visualLeft, className].filter(Boolean).join(' ');
    return (
        <section className={cls} aria-labelledby={`${id}-title`}>
            <div className={styles.inner}>
                <div className={styles.content}>
                    <p className={styles.label}>{label}</p>
                    <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
                    <p className={styles.statement}>{statement}</p>
                </div>
                <div className={styles.visual} aria-hidden="true">{visual}</div>
            </div>
        </section>
    );
}
