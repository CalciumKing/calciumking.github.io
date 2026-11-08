import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import styles from './DirectorySection.module.css';

type SectionProps = {
    className?: string;
    treeRef?: RefObject<HTMLDivElement>; // lets the stage scene measure the tree lines
};

const ENTRIES = [
    { index: '01', label: 'PROJECTS', to: '/projects', description: 'Selected engineering work, software, and development projects.' },
    { index: '02', label: 'ABOUT', to: '/about', description: 'Background, capabilities, and personal introduction.' },
    { index: '03', label: 'RESUME', to: '/resume', description: 'Professional experience, education, and qualifications.' },
    { index: '04', label: 'CONTACT', to: '/contact', description: 'Contact information and correspondence.' },
];

export default function DirectorySection({ className, treeRef }: SectionProps) {
    return (
        <section
            className={className ? `${styles.section} ${className}` : styles.section}
            aria-labelledby="directory-title"
        >
            <div className={styles.inner}>
                <div ref={treeRef} className={styles.tree}>
                    <p className={styles.label}>05 / ARCHITECTURE</p>
                    <h2 id="directory-title" className={styles.root}>
                        ~/CALCIUMKING
                    </h2>
                    <nav aria-label="Site directory">
                        <ul className={styles.list}>
                            <li className={styles.spineItem} aria-hidden="true">
                                <span className={styles.spine} data-tree-line="v" />
                            </li>
                            {ENTRIES.map(({ index, label, to, description }) => (
                                <li key={to} className={styles.item}>
                                    <span className={styles.branch} data-tree-line="h" aria-hidden="true" />
                                    <Link to={to} className={styles.link}>
                                        <span className={styles.text}>
                                            <span className={styles.name}>
                                                {index} / {label}
                                            </span>
                                            <span className={styles.description}>{description}</span>
                                        </span>
                                        <span className={styles.arrow} aria-hidden="true">
                                            →
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </section>
    );
}
