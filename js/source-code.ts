// This script displays its own source code as a page element on the 404 page

(function (): void {
	const codeElement: HTMLElement = document.querySelector<HTMLElement>('#code-element');
	
	fetch('/js/source-code.ts')
		.then((result: Response): Promise<string> => result.text())
		.then((code: string): void => {
			const lines: string[] = code.split('\n');
			let lineNum: number = 0;
			
			const intervalId: number = setInterval((): void => {
				codeElement.textContent += lines[lineNum] + '\n';
				lineNum++;
				
				if (lineNum >= lines.length)
					clearInterval(intervalId);
			}, 300);
		});
})();
