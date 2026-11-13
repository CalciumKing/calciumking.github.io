import { useEffect, useRef, useState } from 'react';
import { useContactContent } from '../contactContent';

type Props = {
	value: string;
	className: string;
	tabIndex: number;
};

export default function CopyButton({ value, className, tabIndex }: Props) {
	const { ui } = useContactContent();
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
			{ state === 'done' ? ui.copied : state === 'fail' ? ui.copyFailed : ui.copy }
		</button>
	);
}
