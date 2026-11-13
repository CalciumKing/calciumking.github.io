import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Footer from '../../../components/Footer/Footer';
import PinnedTrack from '../../../components/PinnedTrack/PinnedTrack';
import ScrollHint from '../../../components/ScrollHint/ScrollHint';
import SectionRail from '../../../components/SectionRail/SectionRail';
import ThreeCanvas from '../../../components/ThreeCanvas/ThreeCanvas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import type { SceneFactory } from '../../../hooks/useThreeScene';
import { type Entry, ENTRY_COUNT, RESUME_URL, useResumeContent } from '../resumeContent';
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

const META: Omit<Stop, 'label' | 'entry' | 'no'>[] = [
	{ id: 'intro', kind: 'intro', frame: 0 },
	...Array.from({ length: ENTRY_COUNT }, (_, i) => ({ id: `entry-${ i }`, kind: 'entry' as const, frame: i + 1 })),
	{ id: 'final', kind: 'final', frame: ENTRY_COUNT + 1 }
];
const N = META.length;
const STEP = 1 / N;
const FINAL_AT = (N - 1) * STEP;
const FINAL_INDEX = N - 1;

const SCENE_STOPS: SceneStop[] = META.map((s) => ({
	frame: s.frame,
	shiftX: s.kind === 'final' ? 0 : 0.22,
	shiftY: s.kind === 'final' ? 0.12 : 0
}));
const STATIC: Progress = { current: FINAL_AT };

function useStops() {
	const { entries, ui } = useResumeContent();
	return useMemo(() => {
		const stops: Stop[] = META.map((m, i) => {
			if (m.kind === 'intro') return { ...m, label: ui.stopIntro };
			if (m.kind === 'final') return { ...m, label: ui.stopFinal };
			const entry = entries[i - 1];
			return { ...m, id: entry.id, label: entry.eyebrow, entry, no: i };
		});
		return { stops, rail: stops.map((s, i) => ({ label: s.label, at: i * STEP })) };
	}, [entries, ui]);
}

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
				stages: ENTRY_COUNT,
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
	const { ui } = useResumeContent();
	
	return (
		<a
			className={ className }
			href={ RESUME_URL }
			download
			tabIndex={ interactive ? 0 : -1 }
			aria-label={ ui.downloadAria }
		>
			{ ui.download }
		</a>
	);
}

function StopBody({ stop, interactive }: {
	stop: Stop;
	interactive: boolean
}) {
	const { ui } = useResumeContent();
	
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
				<p className={ styles.body }>{ ui.final.body }</p>
				<DownloadLink interactive={ interactive } className={ styles.download }/>
			</div>
		);
	}
	const e = stop.entry!;
	return (
		<div className={ styles.panel }>
			<p className={ styles.eyebrow }>{ `// ${ e.eyebrow }` }</p>
			<h2 className={ styles.heading }>{ e.title }</h2>
			<p className={ styles.meta }>{ `${ e.date } · ${ ui.categories[e.category] }` }</p>
			<p className={ styles.body }>{ e.description }</p>
		</div>
	);
}

export default function ResumeStage() {
	const reducedMotion = useReducedMotion();
	const trackRef = useRef<HTMLDivElement>(null);
	const progress = useScrollProgress(trackRef, !reducedMotion);
	const active = useActiveStop(progress, !reducedMotion);
	const { stops: STOPS, rail } = useStops();
	
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
			<SectionRail trackRef={ trackRef } sections={ rail }/>
		</PinnedTrack>
	);
}
