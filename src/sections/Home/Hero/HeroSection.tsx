import type { ReactNode } from 'react';
import ScrollHint from '../../../components/ScrollHint/ScrollHint';
import { useContent } from '../../../i18n/content';
import { homeContent } from '../homeContent';
import styles from './HeroSection.module.css';

type SectionProps = {
	className?: string;
	visual?: ReactNode;
};

export default function HeroSection({ className, visual }: SectionProps) {
	const c = useContent(homeContent).hero;
	
	return (
		<section
			className={ className ? `${ styles.hero } ${ className }` : styles.hero }
			aria-labelledby="hero-title"
		>
			<div className={ styles.inner }>
				<div className={ styles.content }>
					<p className={ styles.role }>{ c.role }</p>
					<h1 id="hero-title" className={ styles.name }>
						<span>{ c.first }</span> <span>{ c.last }</span>
					</h1>
					<p className={ styles.statement }>
						{ c.statement }
					</p>
				</div>
				
				<div className={ styles.visual } aria-hidden="true">
					{ visual }
				</div>
			</div>
			<ScrollHint/>
		</section>
	);
}
