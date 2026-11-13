import { type CSSProperties, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Footer from '../../../components/Footer/Footer';
import PinnedTrack from '../../../components/PinnedTrack/PinnedTrack';
import ScrollHint from '../../../components/ScrollHint/ScrollHint';
import SectionRail from '../../../components/SectionRail/SectionRail';
import ThreeCanvas from '../../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import type { SceneFactory } from '../../../hooks/useThreeScene';
import { type Contact, CONTACT_COUNT, useContactContent } from '../contactContent';
import { createContactScene } from '../scene/createContactScene';
import styles from './ContactStage.module.css';
import CopyButton from './CopyButton';

type Progress = {
	current: number
};
type Side = 'left' | 'right' | 'center';
type Stop = {
	id: string;
	label: string;
	side: Side;
	kind: 'intro' | 'contact' | 'final';
	contact?: Contact;
};

const COUNT = CONTACT_COUNT;
const STEP = 1 / (COUNT + 2);
const FINAL_AT = (COUNT + 1) * STEP;

const SIDES: Side[] = [
	'left',
	...Array.from({ length: COUNT }, (_, i): Side => (i % 2 === 0 ? 'right' : 'left')),
	'center'
];
const SHIFTS = SIDES.map((s) => ({
	x: s === 'right' ? -0.22 : s === 'left' ? 0.22 : 0,
	y: s === 'center' ? 0.12 : 0
}));
const STATIC: Progress = { current: 0 };


function useStops() {
	const { contacts, ui } = useContactContent();
	return useMemo(() => {
		const stops: Stop[] = [
			{ id: 'intro', label: ui.stopSystem, side: SIDES[0], kind: 'intro' },
			...contacts.map((c, i): Stop => ({
				id: c.id, label: c.label, side: SIDES[i + 1], kind: 'contact', contact: c
			})),
			{ id: 'final', label: ui.stopContact, side: SIDES[COUNT + 1], kind: 'final' }
		];
		return { stops, rail: stops.map((s, i) => ({ label: s.label, at: i * STEP })) };
	}, [contacts, ui]);
}

function useActiveStop(progress: Progress, enabled: boolean) {
	const [active, setActive] = useState(0);
	useEffect(() => {
		if (!enabled)
			return;
		const update = () => setActive(Math.round(progress.current / STEP) % (COUNT + 2));
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, [progress, enabled]);
	return active;
}

function ContactCanvas({ progress, reducedMotion, className }: {
	progress: Progress;
	reducedMotion: boolean;
	className: string
}) {
	const factory = useCallback<SceneFactory>(
		(container, options) =>
			createContactScene(container, { ...options, progress, shifts: SHIFTS }),
		[progress]
	);
	return <ThreeCanvas factory={ factory } reducedMotion={ reducedMotion } className={ className }/>;
}

function Actions({ contact, interactive }: {
	contact: Contact;
	interactive: boolean
}) {
	const { ui } = useContactContent();
	const tab = interactive ? 0 : -1;
	return (
		<>
			<a
				className={ styles.link }
				href={ contact.href }
				tabIndex={ tab }
				aria-label={ contact.external ? ui.ariaOpen(contact.label) : ui.ariaMail(contact.display) }
				{ ...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }
			>
				{ contact.external ? ui.open : ui.mail }
			</a>
			{ contact.copy && <CopyButton value={ contact.copy } className={ styles.copy } tabIndex={ tab }/> }
		</>
	);
}

function Rows({ interactive }: {
	interactive: boolean
}) {
	const { contacts } = useContactContent();
	
	return (
		<ul className={ styles.rows }>
			{ contacts.map((c) => (
				<li key={ c.id } className={ styles.row }>
					<span className={ styles.rowLabel }>{ c.label }</span>
					<span className={ styles.rowValue }>{ c.display }</span>
					<span className={ styles.rowActions }>
						<Actions contact={ c } interactive={ interactive }/>
					</span>
				</li>
			)) }
		</ul>
	);
}

function StopBody({ stop, interactive }: {
	stop: Stop;
	index: number;
	interactive: boolean
}) {
	const { ui } = useContactContent();
	
	if (stop.kind === 'intro') {
		return (
			<div className={ styles.panel }>
				<p className={ styles.eyebrow }>{ ui.intro.eyebrow }</p>
				<h1 className={ styles.title }>{ ui.intro.heading }</h1>
				<p className={ styles.body }>{ ui.intro.body }</p>
			</div>
		);
	}
	if (stop.kind === 'final') {
		return (
			<div className={ `${ styles.panel } ${ styles.panelWide }` }>
				<p className={ styles.eyebrow }>{ ui.final.eyebrow }</p>
				<h2 className={ styles.heading }>{ ui.final.heading }</h2>
				<Rows interactive={ interactive }/>
			</div>
		);
	}
	const c = stop.contact!;
	return (
		<div className={ styles.panel }>
			<p className={ styles.eyebrow }>{ `// ${ c.label }` }</p>
			<h2 className={ styles.heading }>{ c.heading }</h2>
			<p className={ styles.value }>{ c.display }</p>
			<div className={ styles.actions }>
				<Actions contact={ c } interactive={ interactive }/>
			</div>
		</div>
	);
}

export default function ContactStage() {
	const reducedMotion = useReducedMotion();
	const trackRef = useRef<HTMLDivElement>(null);
	const progress = useScrollProgress(trackRef, !reducedMotion);
	const active = useActiveStop(progress, !reducedMotion);
	const { stops: STOPS, rail } = useStops();
	
	if (reducedMotion) {
		return (
			<>
				<section className={ styles.block }>
					<StopBody stop={ STOPS[0] } index={ 0 } interactive/>
					<div className={ styles.inlineWrap }>
						<ContactCanvas progress={ STATIC } reducedMotion className={ styles.inline }/>
					</div>
				</section>
				<section className={ `${ styles.block } ${ styles.blockSingle }` }>
					<StopBody stop={ STOPS[STOPS.length - 1] } index={ STOPS.length - 1 } interactive/>
				</section>
				<Footer/>
			</>
		);
	}
	
	return (
		<PinnedTrack trackRef={ trackRef } height={ `${ (COUNT + 2) * 160 }svh` }>
			<ContactCanvas progress={ progress } reducedMotion={ false } className={ styles.canvas }/>
			{ STOPS.map((stop, i) => {
				const cls = [
					styles.layer,
					stop.kind === 'final' && styles.layerEnd,
					i === active && styles.active,
					stop.kind === 'intro' && styles.layerIntro
				]
					.filter(Boolean)
					.join(' ');
				const vars = { '--a': i * STEP, '--half': STEP * 0.45, '--fade': STEP * 0.25 } as CSSProperties;
				return (
					<div key={ stop.id } className={ cls } style={ vars }>
						<div className={ `${ styles.inner } ${ styles[stop.side] }` }>
							<StopBody stop={ stop } index={ i } interactive={ i === active }/>
						</div>
						{ stop.kind === 'intro' && <ScrollHint/> }
					</div>
				);
			}) }
			<div className={ styles.footerSlot } style={ {
				'--flo': FINAL_AT - STEP * 0.25,
				'--fhi': FINAL_AT + STEP * 0.25,
				'--ff': STEP * 0.12
			} as CSSProperties }>
				<Footer/>
			</div>
			<SectionRail trackRef={ trackRef } sections={ rail }/>
		</PinnedTrack>
	);
}
