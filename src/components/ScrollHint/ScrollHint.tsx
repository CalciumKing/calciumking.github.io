import styles from './ScrollHint.module.css';

export default function ScrollHint() {
    return (
        <div className={styles.scroll} aria-hidden="true">
            <span className={styles.label}>SCROLL</span>
            <span className={styles.line} />
        </div>
    );
}
