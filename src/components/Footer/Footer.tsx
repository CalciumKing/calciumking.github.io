import styles from './Footer.module.css';

export default function Footer() {
	return (
		<footer className={ styles.footer }>
			<div className={ styles.inner }>
				<ul className={ styles.items }>
					<li className={ styles.item }>THE CALCIUM KING</li>
					<li className={ styles.item }>LANDEN INGERSLEV</li>
					<li className={ styles.item }>SOFTWARE ENGINEER</li>
				</ul>
				<p className={ styles.copy }>© 2026</p>
			</div>
		</footer>
	);
}
