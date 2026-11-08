import { Link, NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

const LINKS = [
    { label: 'ABOUT', to: '/about' },
    { label: 'PROJECTS', to: '/projects' },
    { label: 'RESUME', to: '/resume' },
    { label: 'CONTACT', to: '/contact' },
];

export default function Navigation() {
    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Primary">
                <Link to="/index.html" className={styles.brand}>
                    ~/CalciumKing
                </Link>
                <ul className={styles.links}>
                    {LINKS.map(({ label, to }) => (
                        <li key={to} className={styles.item}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    isActive ? `${styles.link} ${styles.active}` : styles.link
                                }
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
