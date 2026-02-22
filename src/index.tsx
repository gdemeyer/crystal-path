import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';
// import reportWebVitals from './reportWebVitals.ts';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// When a new service worker is waiting, tell it to skip waiting then reload
// so mobile clients pick up new deployments without requiring a tab close.
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const waiting = registration.waiting;
    if (waiting) {
      // Once the new SW takes control, reload to serve the fresh assets.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
