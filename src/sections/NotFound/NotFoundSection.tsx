import { Link } from 'react-router-dom';
import ThreeCanvas from '../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { createCarnotaurusScene } from './carnotaurusScene';
import styles from './NotFoundSection.module.css';

export default function NotFoundSection() {
	const reducedMotion = useReducedMotion();
	
	return (
		<section className={ styles.section } aria-labelledby="notfound-title">
			<div className={ styles.inner }>
				<div className={ styles.content }>
					<p className={ styles.code }>404</p>
					<h1 id="notfound-title" className={ styles.title }>Territory Uncharted.</h1>
					<p className={ styles.description }>// The requested page could not be located.</p>
					<Link to="/" className={ styles.link }>RETURN TO HOME →</Link>
				</div>
				<div className={ styles.visual } aria-hidden="true">
					<ThreeCanvas factory={ createCarnotaurusScene } reducedMotion={ reducedMotion }
					             className={ styles.canvas }/>
				</div>
			</div>
		</section>
	);
}
