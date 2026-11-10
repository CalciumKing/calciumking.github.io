import type { CSSProperties, ReactNode, RefObject } from 'react';
import styles from './PinnedTrack.module.css';

type Props = {
	trackRef: RefObject<HTMLDivElement>;
	height: string; // total scroll length, e.g. '1200svh'
	className?: string;
	style?: CSSProperties;
	children: ReactNode;
};

export default function PinnedTrack({ trackRef, height, className, style, children }: Props) {
	return (
		<div
			ref={ trackRef }
			className={ className ? `${ styles.track } ${ className }` : styles.track }
			style={ { ...style, height } }
		>
			<div className={ styles.sticky }>{ children }</div>
		</div>
	);
}
