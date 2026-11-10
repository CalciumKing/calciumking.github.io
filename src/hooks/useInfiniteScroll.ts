import { useEffect } from 'react';

const DWELL = 300; // ms you must rest at an edge before a push counts (ignores arrival momentum)
const THRESHOLD = 100; // wheel delta needed past the edge
const TOUCH_THRESHOLD = 80; // px of drag past the edge
const LOCK = 600; // ms of ignored input after a wrap

/**
 * Wraps the page: pushing past the bottom jumps to the top, pushing past the top jumps to the bottom.
 * Native scrolling is untouched everywhere else. Also hides the scrollbar via `html.infinite-scroll`.
 */
export function useInfiniteScroll(enabled: boolean) {
	useEffect(() => {
		if (!enabled) return;
		const root = document.documentElement;
		root.classList.add('infinite-scroll');
		
		const maxY = () => root.scrollHeight - window.innerHeight;
		const atTop = () => window.scrollY <= 1;
		const atBottom = () => window.scrollY >= maxY() - 2;
		
		let lockUntil = 0;
		let edgeSince = performance.now();
		let acc = 0;
		let lastWheel = 0;
		let touchY = 0;
		let touchEdge: 'top' | 'bottom' | null = null;
		
		const wrap = (toTop: boolean) => {
			lockUntil = performance.now() + LOCK;
			acc = 0;
			window.scrollTo({ top: toTop ? 0 : maxY(), behavior: 'instant' });
		};
		
		const onScroll = () => {
			if (!atTop() && !atBottom()) edgeSince = 0;
			else if (!edgeSince) edgeSince = performance.now();
		};
		
		const onWheel = (e: WheelEvent) => {
			if (e.ctrlKey) return; // pinch zoom
			const now = performance.now();
			if (now < lockUntil) {
				e.preventDefault(); // swallow momentum from the gesture that caused the wrap
				return;
			}
			const down = e.deltaY > 0;
			const atEdge = down ? atBottom() : atTop();
			if (!atEdge || !edgeSince || now - edgeSince < DWELL) {
				acc = 0;
				return;
			}
			if (now - lastWheel > 200) acc = 0;
			lastWheel = now;
			acc += Math.abs(e.deltaY);
			if (acc >= THRESHOLD) {
				e.preventDefault();
				wrap(down);
			}
		};
		
		const onTouchStart = (e: TouchEvent) => {
			touchY = e.touches[0].clientY;
			touchEdge = atBottom() ? 'bottom' : atTop() ? 'top' : null;
		};
		
		const onTouchMove = (e: TouchEvent) => {
			if (!touchEdge || performance.now() < lockUntil) return;
			const dy = touchY - e.touches[0].clientY; // > 0: dragging up = scrolling down
			if (touchEdge === 'bottom' && dy > TOUCH_THRESHOLD) wrap(true);
			else if (touchEdge === 'top' && dy < -TOUCH_THRESHOLD) wrap(false);
		};
		
		const onKeyDown = (e: KeyboardEvent) => {
			const el = e.target as HTMLElement | null;
			if (el?.closest('input, textarea, select, [contenteditable]')) return;
			if (performance.now() < lockUntil) return;
			const down = ['ArrowDown', 'PageDown', ' '].includes(e.key) && !e.shiftKey;
			const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
			if (down && atBottom()) {
				e.preventDefault();
				wrap(true);
			} else if (up && atTop()) {
				e.preventDefault();
				wrap(false);
			}
		};
		
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: true });
		window.addEventListener('keydown', onKeyDown);
		return () => {
			root.classList.remove('infinite-scroll');
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [enabled]);
}
