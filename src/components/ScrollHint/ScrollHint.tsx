import { common } from '../../i18n/common';
import { useContent } from '../../i18n/content';
import styles from './ScrollHint.module.css';

export default function ScrollHint() {
	const c = useContent(common);
	
	return (
		<div className={ styles.scroll } aria-hidden="true">
			<span className={ styles.label }>{ c.scroll }</span>
			<span className={ styles.line }/>
		</div>
	);
}
