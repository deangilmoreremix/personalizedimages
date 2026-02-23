import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
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
import { PersonalizationProvider } from './contexts/PersonalizationContext.tsx';

preloadCommonFonts();

const backend = isMobile() ? TouchBackend : HTML5Backend;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

setupNetworkListeners(
  () => console.log('Network: Back online'),
  () => console.log('Network: Gone offline')
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PersonalizationProvider>
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
      </PersonalizationProvider>
    </AuthProvider>
  </StrictMode>
);