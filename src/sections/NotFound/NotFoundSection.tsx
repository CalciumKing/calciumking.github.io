import { Link } from 'react-router-dom';
import ThreeCanvas from '../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContent } from '../../i18n/content';
import { createCarnotaurusScene } from './carnotaurusScene';
import { notFoundContent } from './notFoundContent';
import styles from './NotFoundSection.module.css';

export default function NotFoundSection() {
	const c = useContent(notFoundContent);
	const reducedMotion = useReducedMotion();
	
	return (
		<section className={ styles.section } aria-labelledby="notfound-title">
			<div className={ styles.inner }>
				<div className={ styles.content }>
					<p className={ styles.code }>{c.code}</p>
					<h1 id="notfound-title" className={ styles.title }>{c.title}</h1>
					<p className={ styles.description }>{c.description}</p>
					<Link to="/" className={ styles.link }>{c.link}</Link>
				</div>
				<div className={ styles.visual } aria-hidden="true">
					<ThreeCanvas factory={ createCarnotaurusScene } reducedMotion={ reducedMotion }
					             className={ styles.canvas }/>
				</div>
			</div>
		</section>
	);
}
