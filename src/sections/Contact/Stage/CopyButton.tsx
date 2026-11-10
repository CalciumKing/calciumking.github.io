import { useEffect, useRef, useState } from 'react';

type Props = {
	value: string;
	className: string;
	tabIndex: number;
};

export default function CopyButton({ value, className, tabIndex }: Props) {
	const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle');
	const timer = useRef(0);
	
	useEffect(() => () => window.clearTimeout(timer.current), []);
	
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setState('done');
		} catch {
			setState('fail');
		}
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => setState('idle'), 1800);
	};
	
	return (
		<button type="button" className={ className } onClick={ copy } tabIndex={ tabIndex } aria-live="polite">
			{ state === 'done' ? 'COPIED' : state === 'fail' ? 'COPY FAILED' : 'COPY' }
		</button>
	);
}
