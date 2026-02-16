import { StrictMode } from 'react'; // StrictMode highlights potential problems in an application
import { createRoot } from 'react-dom/client'; // Import the createRoot method to render the app
import './index.css'; // Import global styles
import App from './App.jsx'; // Import the main App component

// Create the root element and render the App component inside it
// StrictMode wraps the entire app to activate additional checks and warnings for descendants.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
