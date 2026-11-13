import { CSSProperties, type RefObject, useCallback, useMemo, useRef } from 'react';
import Footer from '../../../components/Footer/Footer';
import PinnedTrack from '../../../components/PinnedTrack/PinnedTrack';
import SectionRail from '../../../components/SectionRail/SectionRail';
import ThreeCanvas from '../../../components/ThreeCanvas/ThreeCanvas';
import { useProgressRange } from '../../../hooks/useProgressRange';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useScrollProgress } from '../../../hooks/useScrollProgress';
import type { SceneFactory } from '../../../hooks/useThreeScene';
import { useContent } from '../../../i18n/content';
import DirectorySection from '../Directory/DirectorySection';
import HeroSection from '../Hero/HeroSection';
import { homeContent } from '../homeContent';
import { useSections } from '../StatementSection/Sections';
import StatementSection from '../StatementSection/StatementSection';
import styles from './HomeStage.module.css';
import { DIR_END, OLD_SHARE } from './phases';
import { createStageScene, STAGE_PROGRESS, StageLayout } from './StageScene';

type Progress = {
	current: number
};
const HERO: Progress = { current: STAGE_PROGRESS.hero };
const CPU: Progress = { current: STAGE_PROGRESS.computation };
const NETWORK: Progress = { current: STAGE_PROGRESS.intelligence };
const GEOMETRY: Progress = { current: STAGE_PROGRESS.geometry };
const staticVisual = (progress: Progress) => (
	<StageCanvas progress={ progress } layout="inline" reducedMotion className={ styles.inlineCanvas }/>
);

type CanvasProps = {
	progress: Progress;
	layout: StageLayout;
	reducedMotion: boolean;
	className: string;
	tree?: RefObject<HTMLElement>;
};

function StageCanvas({ progress, layout, reducedMotion, className, tree }: CanvasProps) {
	const factory = useCallback<SceneFactory>(
		(container, options) =>
			createStageScene(container, { ...options, layout, progress, tree }),
		[layout, progress, tree]
	);
	return <ThreeCanvas factory={ factory } reducedMotion={ reducedMotion } className={ className }/>;
}

export default function HomeStage() {
	const reducedMotion = useReducedMotion();
	const trackRef = useRef<HTMLDivElement>(null);
	const treeRef = useRef<HTMLDivElement>(null);
	const progress = useScrollProgress(trackRef, !reducedMotion);
	const directoryActive = useProgressRange(progress, 0.65, 0.8, !reducedMotion);
	const SECTIONS = useSections();
	const railLabels = useContent(homeContent).rail;
	const rail = useMemo(
		() => [0, 0.153, 0.375, 0.55, 0.72].map((at, i) => ({ label: railLabels[i], at })),
		[railLabels]
	);
	
	if (reducedMotion) {
		return (
			<>
				<HeroSection
					visual={ staticVisual(HERO) }
				/>
				<StatementSection
					{ ...SECTIONS.computation }
					visual={ staticVisual(CPU) }
				/>
				<StatementSection
					{ ...SECTIONS.intelligence }
					visual={ staticVisual(NETWORK) }
				/>
				<StatementSection
					{ ...SECTIONS.geometry }
					visual={ staticVisual(GEOMETRY) }
				/>
				<DirectorySection/>
				<Footer/>
			</>
		);
	}
	
	return (
		<PinnedTrack
			trackRef={ trackRef }
			height="1200svh"
			className={ styles.track }
			style={ { '--old-share': OLD_SHARE, '--dir-end': DIR_END } as CSSProperties }
		>
			<StageCanvas progress={ progress } layout="stage" reducedMotion={ false } className={ styles.canvas }
			             tree={ treeRef }/>
			<div className={ `${ styles.layer } ${ styles.heroLayer }` }>
				<HeroSection/>
			</div>
			<div className={ `${ styles.layer } ${ styles.computationLayer }` }>
				<StatementSection { ...SECTIONS.computation } />
			</div>
			<div className={ `${ styles.layer } ${ styles.intelligenceLayer }` }>
				<StatementSection { ...SECTIONS.intelligence } />
			</div>
			<div className={ `${ styles.layer } ${ styles.geometryLayer }` }>
				<StatementSection { ...SECTIONS.geometry } />
			</div>
			<div
				className={ `${ styles.layer } ${ styles.directoryLayer }${ directoryActive
				                                                            ? ` ${ styles.directoryActive }` : '' }` }
			>
				<DirectorySection treeRef={ treeRef }/>
				<div className={ styles.footerSlot }>
					<Footer/>
				</div>
			</div>
			<SectionRail trackRef={ trackRef } sections={ rail }/>
		</PinnedTrack>
	);
}
