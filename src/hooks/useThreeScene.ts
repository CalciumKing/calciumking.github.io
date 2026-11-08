import { useEffect, useRef, useState } from 'react';

export type SceneOptions = { reducedMotion: boolean };
export type SceneHandle = { dispose: () => void };
export type SceneFactory = (container: HTMLElement, options: SceneOptions) => SceneHandle;

/**
 * Mounts a framework-free Three.js scene into a container and disposes it on unmount.
 * `factory` must be a stable reference (a module-level function).
 * Returns `failed: true` if the scene could not start (e.g. WebGL unavailable).
 */
export function useThreeScene(factory: SceneFactory, reducedMotion: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let handle: SceneHandle | null = null;
        try {
            handle = factory(container, { reducedMotion });
            setFailed(false);
        } catch (error) {
            console.warn('Three.js scene failed to initialize:', error);
            setFailed(true);
        }

        return () => {
            handle?.dispose();
        };
    }, [factory, reducedMotion]);

    return { containerRef, failed };
}
