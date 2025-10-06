import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ModernHeader from './components/layout/ModernHeader';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import TemplatesShowcase from './components/TemplatesShowcase';
import Integrations from './components/Integrations';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import EditorPage from './pages/EditorPage';
import FeatureShowcase from './components/FeatureShowcase';
import ActionFigureShowcase from './components/ActionFigureShowcase';
import CartoonStylesShowcase from './components/CartoonStylesShowcase';
import ActionFigurePage from './pages/features/ActionFigurePage';
import RetroActionFigurePage from './pages/features/RetroActionFigurePage';
import MusicStarActionFigurePage from './pages/features/MusicStarActionFigurePage';
import TVShowActionFigurePage from './pages/features/TVShowActionFigurePage';
import WrestlingActionFigurePage from './pages/features/WrestlingActionFigurePage';
import GhibliStylePage from './pages/features/GhibliStylePage';
import CartoonStylePage from './pages/features/CartoonStylePage';
import MemeGeneratorPage from './pages/features/MemeGeneratorPage';
import AIImagePage from './pages/features/AIImagePage';
import FloatingFeatures from './components/FloatingFeatures';
import GifEditorDemo from './pages/GifEditorDemo';
import FontsPage from './pages/FontsPage';
import TokensPanel from './pages/TokensPanel';
import GeminiDocs from './pages/GeminiDocs';
import EdgeFunctionDebugging from './pages/EdgeFunctionDebugging';
import GeminiNanoEditorPage from './pages/features/GeminiNanoEditorPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Component for conditionally rendering footer and other components
const AppLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <ModernHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/features/action-figures" element={<ActionFigurePage />} />
          <Route path="/features/retro-action-figures" element={<RetroActionFigurePage />} />
          <Route path="/features/music-star-action-figures" element={<MusicStarActionFigurePage />} />
          <Route path="/features/tv-show-action-figures" element={<TVShowActionFigurePage />} />
          <Route path="/features/wrestling-action-figures" element={<WrestlingActionFigurePage />} />
          <Route path="/features/ghibli-style" element={<GhibliStylePage />} />
          <Route path="/features/cartoon-style" element={<CartoonStylePage />} />
          <Route path="/features/meme-generator" element={<MemeGeneratorPage />} />
          <Route path="/features/ai-image" element={<AIImagePage />} />
          <Route path="/features/gemini-nano-editor" element={<GeminiNanoEditorPage />} />
          <Route path="/gif-editor" element={<GifEditorDemo />} />
          <Route path="/fonts" element={<FontsPage />} />
          <Route path="/tokens" element={<TokensPanel tokens={{FIRSTNAME: 'User', LASTNAME: 'Example'}} />} />
          <Route path="/gemini-docs" element={<GeminiDocs />} />
          <Route path="/debug" element={<EdgeFunctionDebugging />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </main>
      {isHomePage && <Footer />}
      <PWAInstallPrompt />
    </>
  );
};

// Home page component that combines all sections
function HomePage() {
  return (
    <>
      <Hero />
      <FloatingFeatures />
      <HowItWorks />
      <Benefits />
      <ActionFigureShowcase />
      <FeatureShowcase />
      <CartoonStylesShowcase />
      <TemplatesShowcase />
      <Integrations />
      <Testimonials />
      <FAQ />
      <CTASection />
    </>
  );
}

// Individual component pages
function HowItWorksPage() {
  return <HowItWorks />;
}

function BenefitsPage() {
  return <Benefits />;
}

function TemplatesPage() {
  return <TemplatesShowcase />;
}

function IntegrationsPage() {
  return <Integrations />;
}

function TestimonialsPage() {
  return <Testimonials />;
}

function FAQPage() {
  return <FAQ />;
}

// App component without Router wrapping
function App() {
  return <AppLayout />;
}

export default App;