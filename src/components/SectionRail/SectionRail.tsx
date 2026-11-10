import type { CSSProperties, RefObject } from 'react';
import styles from './SectionRail.module.css';

type Section = {
	label: string;
	at: number
};

const HOME_SECTIONS: Section[] = [
	{ label: 'Hero', at: 0 },
	{ label: 'Computation', at: 0.153 },
	{ label: 'Intelligence', at: 0.375 },
	{ label: 'Geometry', at: 0.55 },
	{ label: 'Directory', at: 0.72 }
];

type Props = {
	trackRef: RefObject<HTMLElement>;
	sections?: Section[];
	loop?: boolean;
	fixed?: boolean;
	leading?: string;
};

export default function SectionRail({
	                                    trackRef,
	                                    sections = HOME_SECTIONS,
	                                    loop = true,
	                                    fixed = false,
	                                    leading
                                    }: Props) {
	const goTo = (at: number) => {
		const track = trackRef.current;
		if (!track)
			return;
		const sticky = track.firstElementChild as HTMLElement | null;
		const range = track.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight);
		const top = track.getBoundingClientRect().top + window.scrollY + at * range;
		window.scrollTo({ top, behavior: 'smooth' });
	};
	
	return (
		<nav
			className={ [styles.rail, !loop && styles.flat, fixed && styles.fixed].filter(Boolean).join(' ') }
			aria-label="Page sections"
		>
			<ul className={ styles.list }>
				{ leading && (
					<li>
						<button
							type="button"
							className={ `${ styles.button } ${ styles.leading }` }
							aria-label={ leading }
							onClick={ () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
						>
							<span className={ styles.line }/>
						</button>
					</li>
				) }
				{ sections.map(({ label, at }) => (
					<li key={ label }>
						<button
							type="button"
							className={ styles.button }
							style={ { '--c': at } as CSSProperties }
							aria-label={ label }
							onClick={ () => goTo(at) }
						>
							<span className={ styles.line }/>
						</button>
					</li>
				)) }
			</ul>
		</nav>
	);
}
