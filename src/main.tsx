import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AppTest from './App.test.tsx';
import './index.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from './utils/deviceDetection';
import { preloadCommonFonts } from './services/FontService';
import DragLayer from './components/DragLayer.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import { AiAssistantProvider } from './components/ui/AiAssistantProvider.tsx';
import { BrowserRouter } from 'react-router-dom';
import { registerServiceWorker, setupNetworkListeners } from './utils/pwaUtils';
import { AdminProvider } from './contexts/AdminContext.tsx';

// Preload commonly used fonts
preloadCommonFonts();

// Choose the appropriate backend based on the device
const backend = isMobile() ? TouchBackend : HTML5Backend;

// Register service worker and setup PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

// Setup network listeners for offline/online detection
setupNetworkListeners(
  () => console.log('Network: Back online'),
  () => console.log('Network: Gone offline')
);

// Use TEST mode to verify rendering works
const TEST_MODE = false;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {TEST_MODE ? (
      <AppTest />
    ) : (
      <AuthProvider>
        <AdminProvider>
          <BrowserRouter>
            <AiAssistantProvider>
              <DndProvider backend={backend}>
                <App />
                <DragLayer />
              </DndProvider>
            </AiAssistantProvider>
          </BrowserRouter>
        </AdminProvider>
      </AuthProvider>
    )}
  </StrictMode>
);