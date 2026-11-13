import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../../i18n/content';
import { homeContent } from '../homeContent';
import styles from './DirectorySection.module.css';

type SectionProps = {
	className?: string;
	treeRef?: RefObject<HTMLDivElement>;
};

const ROUTES = ['/projects', '/about', '/resume', '/contact'];

export default function DirectorySection({ className, treeRef }: SectionProps) {
	const c = useContent(homeContent).directory;
	
	return (
		<section
			className={ className ? `${ styles.section } ${ className }` : styles.section }
			aria-labelledby="directory-title"
		>
			<div className={ styles.inner }>
				<div ref={ treeRef } className={ styles.tree }>
					<p className={ styles.label }>{ c.label }</p>
					<h2 id="directory-title" className={ styles.root }>
						~/CALCIUMKING
					</h2>
					<nav aria-label="Site directory">
						<ul className={ styles.list }>
							<li className={ styles.spineItem } aria-hidden="true">
								<span className={ styles.spine } data-tree-line="v"/>
							</li>
							{ c.entries.map(({ label, description }, i) => (
								<li key={ ROUTES[i] } className={ styles.item }>
									<span className={ styles.branch } data-tree-line="h" aria-hidden="true"/>
									<Link to={ ROUTES[i] } className={ styles.link }>
                                        <span className={ styles.text }>
                                            <span className={ styles.name }>
                                                /{ label }
                                            </span>
                                            <span className={ styles.description }>{ description }</span>
                                        </span>
										<span className={ styles.arrow } aria-hidden="true">
                                            →
                                        </span>
									</Link>
								</li>
							)) }
						</ul>
					</nav>
				</div>
			</div>
		</section>
	);
}
