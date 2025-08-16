
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure process.env.API_KEY is polyfilled or available in the environment
// For this example, we assume it's globally available, e.g. through a Vite/Webpack define plugin or an HTML script tag.
// In a real scenario, this might be:
// if (!process.env.API_KEY) {
//   console.warn("API_KEY environment variable is not set. AI features will not work.");
// }
// However, per instructions, assume process.env.API_KEY is pre-configured.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);