import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);

// Splash screen (markup lives in index.html): hold briefly, then fade out and remove it.
const splash = document.getElementById('splash');
if (splash) {
    const minimum = new Promise((resolve) => setTimeout(resolve, 900));
    const fonts = Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 2500))]);
    Promise.all([minimum, fonts]).then(() => {
        splash.classList.add('is-hidden');
        window.setTimeout(() => splash.remove(), 600);
    });
}
