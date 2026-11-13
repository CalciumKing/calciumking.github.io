import { common } from '../../i18n/common';
import { useContent } from '../../i18n/content';
import styles from './Footer.module.css';

export default function Footer() {
	const c = useContent(common);
	
	return (
		<footer className={ styles.footer }>
			<div className={ styles.inner }>
				<ul className={ styles.items }>
					{ c.footer.map((t) => <li key={ t } className={ styles.item }>{ t }</li>) }
				</ul>
				<p className={ styles.copy }>© 2026</p>
			</div>
		</footer>
	);
}
