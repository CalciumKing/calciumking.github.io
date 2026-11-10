import { type SceneFactory, useThreeScene } from '../../hooks/useThreeScene';
import styles from './ThreeCanvas.module.css';

type Props = {
	factory: SceneFactory;
	reducedMotion: boolean;
	className: string
};

export default function ThreeCanvas({ factory, reducedMotion, className }: Props) {
	const { containerRef, failed } = useThreeScene(factory, reducedMotion);
	return (
		<>
			<div ref={ containerRef } className={ className }/>
			{ failed && <p className={ styles.fallback }>3D visualization unavailable</p> }
		</>
	);
}
