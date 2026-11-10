import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

const LINKS = [
	{ label: '/ABOUT', to: '/about' },
	{ label: '/PROJECTS', to: '/projects' },
	{ label: '/RESUME', to: '/resume' },
	{ label: '/CONTACT', to: '/contact' }
];

export default function Navigation() {
	const { pathname } = useLocation();
	const toTop = (to: string) => (e: React.MouseEvent) => {
		if (pathname === to) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};
	
	return (
		<header className={ styles.header }>
			<nav className={ styles.nav } aria-label="Primary">
				<Link to="/" onClick={ toTop('/') } className={ styles.brand }>
					~/CalciumKing
				</Link>
				<ul className={ styles.links }>
					{ LINKS.map(({ label, to }) => (
						<li key={ to } className={ styles.item }>
							<NavLink
								to={ to }
								onClick={ toTop(to) }
								className={ ({ isActive }) =>
									isActive ? `${ styles.link } ${ styles.active }` : styles.link
								}
							>
								{ label }
							</NavLink>
						</li>
					)) }
				</ul>
			</nav>
		</header>
	);
}
