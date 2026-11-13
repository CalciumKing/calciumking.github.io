import { Link, NavLink, useLocation } from 'react-router-dom';
import { common } from '../../i18n/common';
import { useContent } from '../../i18n/content';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import styles from './Navigation.module.css';

export default function Navigation() {
	const c = useContent(common);
	const { pathname } = useLocation();
	const toTop = (to: string) => (e: React.MouseEvent) => {
		if (pathname === to) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};
	
	return (
		<header className={ styles.header }>
			<nav className={ styles.nav } aria-label={ c.navLabel }>
				<Link to="/" onClick={ toTop('/') } className={ styles.brand }>
					~/CalciumKing
				</Link>
				<ul className={ styles.links }>
					{ c.links.map(({ label, to }) => (
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
					<li className={ styles.item }><LanguageToggle/></li>
				</ul>
			</nav>
		</header>
	);
}
