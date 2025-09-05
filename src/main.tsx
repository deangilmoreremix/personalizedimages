import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from './utils/deviceDetection';
import { preloadCommonFonts } from './services/FontService';
import { MultipleDndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import DragLayer from './components/DragLayer.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import { AiAssistantProvider } from './components/ui/AiAssistantProvider.tsx';
import { BrowserRouter } from 'react-router-dom';

// Preload commonly used fonts
preloadCommonFonts();

// Choose the appropriate backend based on the device
const backend = isMobile() ? TouchBackend : HTML5Backend;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AiAssistantProvider>
          <DndProvider backend={backend}>
            <App />
            <DragLayer />
          </DndProvider>
        </AiAssistantProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);