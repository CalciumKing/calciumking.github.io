import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import Footer from '../../../components/Footer/Footer';
import PinnedTrack from '../../../components/PinnedTrack/PinnedTrack';
import ScrollHint from '../../../components/ScrollHint/ScrollHint';
import SectionRail from '../../../components/SectionRail/SectionRail';
import ThreeCanvas from '../../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import type { SceneFactory } from '../../../hooks/useThreeScene';
import { CATEGORY_LABEL, ENTRIES, type Entry, FINAL, INTRO, RESUME_URL } from '../resumeContent';
import { createResumeScene } from '../scene/createResumeScene';
import type { SceneStop } from '../scene/keyframes';
import styles from './ResumeStage.module.css';

type Progress = {
	current: number
};

type Stop = {
	id: string;
	kind: 'intro' | 'entry' | 'final';
	label: string;
	frame: number;
	entry?: Entry;
	no?: number;
};

const STOPS: Stop[] = [
	{ id: 'intro', kind: 'intro', label: 'Resume', frame: 0 },
	...ENTRIES.map((entry, i): Stop => ({
		id: entry.id,
		kind: 'entry',
		label: entry.eyebrow,
		frame: i + 1,
		entry,
		no: i + 1
	})),
	{ id: 'final', kind: 'final', label: 'Download', frame: ENTRIES.length + 1 }
];
const N = STOPS.length;
const STEP = 1 / N;
const FINAL_AT = (N - 1) * STEP;
const FINAL_INDEX = N - 1;

const SCENE_STOPS: SceneStop[] = STOPS.map((s) => ({
	frame: s.frame,
	shiftX: s.kind === 'final' ? 0 : 0.22,
	shiftY: s.kind === 'final' ? 0.12 : 0
}));
const RAIL = STOPS.map((s, i) => ({ label: s.label, at: i * STEP }));
const STATIC: Progress = { current: FINAL_AT };

function useActiveStop(progress: Progress, enabled: boolean) {
	const [active, setActive] = useState(0);
	useEffect(() => {
		if (!enabled)
			return;
		const update = () => setActive(Math.round(progress.current / STEP) % N);
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

function ResumeCanvas({ progress, reducedMotion, inline, className }: {
	progress: Progress;
	reducedMotion: boolean;
	inline?: boolean;
	className: string;
}) {
	const factory = useCallback<SceneFactory>(
		(container, options) =>
			createResumeScene(container, {
				...options,
				progress,
				stops: SCENE_STOPS,
				stages: ENTRIES.length,
				inline
			}),
		[progress, inline]
	);
	return <ThreeCanvas factory={ factory } reducedMotion={ reducedMotion } className={ className }/>;
}

function DownloadLink({ interactive, className }: {
	interactive: boolean;
	className: string
}) {
	return (
		<a
			className={ className }
			href={ RESUME_URL }
			download
			tabIndex={ interactive ? 0 : -1 }
			aria-label="Download resume (PDF)"
		>
			DOWNLOAD RESUME ↓
		</a>
	);
}

function StopBody({ stop, interactive }: {
	stop: Stop;
	interactive: boolean
}) {
	if (stop.kind === 'intro') {
		return (
			<div className={ styles.panel }>
				<p className={ styles.eyebrow }>{ INTRO.eyebrow }</p>
				<h1 className={ styles.title }>{ INTRO.heading }</h1>
				<p className={ styles.body }>{ INTRO.body }</p>
			</div>
		);
	}
	if (stop.kind === 'final') {
		return (
			<div className={ `${ styles.panel } ${ styles.panelWide }` }>
				<p className={ styles.eyebrow }>{ FINAL.eyebrow }</p>
				<h2 className={ styles.heading }>{ FINAL.heading }</h2>
				<p className={ styles.body }>{ FINAL.body }</p>
				<DownloadLink interactive={ interactive } className={ styles.download }/>
			</div>
		);
	}
	const e = stop.entry!;
	return (
		<div className={ styles.panel }>
			<p className={ styles.eyebrow }>{ `// ${ e.eyebrow }` }</p>
			<h2 className={ styles.heading }>{ e.title }</h2>
			<p className={ styles.meta }>{ `${ e.date } · ${ CATEGORY_LABEL[e.category] }` }</p>
			<p className={ styles.body }>{ e.description }</p>
		</div>
	);
}

export default function ResumeStage() {
	const reducedMotion = useReducedMotion();
	const trackRef = useRef<HTMLDivElement>(null);
	const progress = useScrollProgress(trackRef, !reducedMotion);
	const active = useActiveStop(progress, !reducedMotion);
	
	if (reducedMotion) {
		return (
			<>
				{ STOPS.slice(0, FINAL_INDEX).map((stop) => (
					<section key={ stop.id } className={ `${ styles.block } ${ styles.blockSingle }` }>
						<StopBody stop={ stop } interactive/>
					</section>
				)) }
				<section className={ styles.block }>
					<div className={ styles.inlineWrap }>
						<ResumeCanvas progress={ STATIC } reducedMotion inline className={ styles.inline }/>
					</div>
					<StopBody stop={ STOPS[FINAL_INDEX] } interactive/>
				</section>
				<DownloadLink interactive className={ `${ styles.dock } ${ styles.dockStatic }` }/>
				<Footer/>
			</>
		);
	}
	
	const finalActive = active === FINAL_INDEX;
	
	return (
		<PinnedTrack trackRef={ trackRef } height={ `${ N * 150 }svh` }>
			<ResumeCanvas progress={ progress } reducedMotion={ false } className={ styles.canvas }/>
			{ STOPS.map((stop, i) => {
				const cls = [
					styles.layer,
					stop.kind === 'final' && styles.layerEnd,
					stop.kind === 'intro' && styles.layerIntro,
					i === active && styles.active
				]
					.filter(Boolean)
					.join(' ');
				const vars = { '--a': i * STEP, '--half': STEP * 0.45, '--fade': STEP * 0.25 } as CSSProperties;
				return (
					<div key={ stop.id } className={ cls } style={ vars }>
						<div className={ `${ styles.inner } ${ stop.kind === 'final' ? styles.center : styles.left }` }>
							<StopBody stop={ stop } interactive={ i === active }/>
						</div>
						{ stop.kind === 'intro' && <ScrollHint/> }
					</div>
				);
			}) }
			<div
				className={ styles.footerSlot }
				style={ {
					'--flo': FINAL_AT - STEP * 0.25,
					'--fhi': FINAL_AT + STEP * 0.25,
					'--ff': STEP * 0.12
				} as CSSProperties }
			>
				<Footer/>
			</div>
			<DownloadLink
				interactive={ !finalActive }
				className={ `${ styles.dock } ${ finalActive ? styles.dockHidden : '' }` }
			/>
			<SectionRail trackRef={ trackRef } sections={ RAIL }/>
		</PinnedTrack>
	);
}
