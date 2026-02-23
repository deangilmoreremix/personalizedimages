import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ModernHeader from './components/layout/ModernHeader';
import { ThemeProvider } from './components/ui/ThemeProvider';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import TemplatesShowcase from './components/TemplatesShowcase';
import Integrations from './components/Integrations';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import FeatureShowcase from './components/FeatureShowcase';
import ActionFigureShowcase from './components/ActionFigureShowcase';
import CartoonStylesShowcase from './components/CartoonStylesShowcase';
import FloatingFeatures from './components/FloatingFeatures';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { AssetProvider } from './contexts/AssetContext';
import { StockImageProvider } from './contexts/StockImageContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

const EditorPage = React.lazy(() => import('./pages/EditorPage'));
const UnifiedImageDashboard = React.lazy(() => import('./components/UnifiedImageDashboard'));
const Gallery = React.lazy(() => import('./components/Gallery'));
const MultiModelComparison = React.lazy(() => import('./components/MultiModelComparison'));
const BatchGeneration = React.lazy(() => import('./components/BatchGeneration'));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));
const GenerationQueue = React.lazy(() => import('./components/GenerationQueue'));
const TokenManagement = React.lazy(() => import('./components/TokenManagement'));
const UniversalPersonalizationPanel = React.lazy(() => import('./components/UniversalPersonalizationPanel'));
const ActionFigurePage = React.lazy(() => import('./pages/features/ActionFigurePage'));
const RetroActionFigurePage = React.lazy(() => import('./pages/features/RetroActionFigurePage'));
const MusicStarActionFigurePage = React.lazy(() => import('./pages/features/MusicStarActionFigurePage'));
const TVShowActionFigurePage = React.lazy(() => import('./pages/features/TVShowActionFigurePage'));
const WrestlingActionFigurePage = React.lazy(() => import('./pages/features/WrestlingActionFigurePage'));
const GhibliStylePage = React.lazy(() => import('./pages/features/GhibliStylePage'));
const CartoonStylePage = React.lazy(() => import('./pages/features/CartoonStylePage'));
const MemeGeneratorPage = React.lazy(() => import('./pages/features/MemeGeneratorPage'));
const AIImagePage = React.lazy(() => import('./pages/features/AIImagePage'));
const ModernAIImagePage = React.lazy(() => import('./pages/features/ModernAIImagePage'));
const ReimaginedAIImagePage = React.lazy(() => import('./pages/features/ReimaginedAIImagePage'));
const ModernActionFigurePage = React.lazy(() => import('./pages/features/ModernActionFigurePage'));
const ModernMemeGeneratorPage = React.lazy(() => import('./pages/features/ModernMemeGeneratorPage'));
const ModernGhibliStylePage = React.lazy(() => import('./pages/features/ModernGhibliStylePage'));
const ModernCartoonStylePage = React.lazy(() => import('./pages/features/ModernCartoonStylePage'));
const ModernBatchGenerationPage = React.lazy(() => import('./pages/features/ModernBatchGenerationPage'));
const ModernVideoConverterPage = React.lazy(() => import('./pages/features/ModernVideoConverterPage'));
const GeminiNanoEditorPage = React.lazy(() => import('./pages/features/GeminiNanoEditorPage'));
const CrazyImagePage = React.lazy(() => import('./pages/features/CrazyImagePage'));
const GifEditorDemo = React.lazy(() => import('./pages/GifEditorDemo'));
const FontsPage = React.lazy(() => import('./pages/FontsPage'));
const TokensPanel = React.lazy(() => import('./pages/TokensPanel'));
const GeminiDocs = React.lazy(() => import('./pages/GeminiDocs'));
const EdgeFunctionDebugging = React.lazy(() => import('./pages/EdgeFunctionDebugging'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AIToolsHub = React.lazy(() => import('./pages/AIToolsHub'));
const MarketplacePage = React.lazy(() => import('./pages/MarketplacePage'));
const FreepikDemo = React.lazy(() => import('./pages/FreepikDemo'));

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Go Home
      </a>
    </div>
  );
}

const AppLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <ErrorBoundary>
      <ModernHeader />
      <main>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><UnifiedImageDashboard /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path="/model-comparison" element={<ProtectedRoute><MultiModelComparison tokens={{}} /></ProtectedRoute>} />
            <Route path="/batch-generation" element={<ProtectedRoute><BatchGeneration tokens={{}} /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/queue" element={<ProtectedRoute><GenerationQueue /></ProtectedRoute>} />
            <Route path="/token-management" element={<ProtectedRoute><TokenManagement currentTokens={{}} onTokensChange={() => {}} /></ProtectedRoute>} />
            <Route path="/personalization" element={<ProtectedRoute><UniversalPersonalizationPanel onClose={() => window.history.back()} /></ProtectedRoute>} />
            <Route path="/features/action-figures" element={<ActionFigurePage />} />
            <Route path="/features/retro-action-figures" element={<RetroActionFigurePage />} />
            <Route path="/features/music-star-action-figures" element={<MusicStarActionFigurePage />} />
            <Route path="/features/tv-show-action-figures" element={<TVShowActionFigurePage />} />
            <Route path="/features/wrestling-action-figures" element={<WrestlingActionFigurePage />} />
            <Route path="/features/ghibli-style" element={<GhibliStylePage />} />
            <Route path="/features/cartoon-style" element={<CartoonStylePage />} />
            <Route path="/features/meme-generator" element={<MemeGeneratorPage />} />
            <Route path="/features/ai-image" element={<AIImagePage />} />
            <Route path="/features/modern-ai-image" element={<ModernAIImagePage />} />
            <Route path="/features/reimagined-ai-image" element={<ReimaginedAIImagePage />} />
            <Route path="/features/modern-action-figures" element={<ModernActionFigurePage />} />
            <Route path="/features/modern-meme-generator" element={<ModernMemeGeneratorPage />} />
            <Route path="/features/modern-ghibli-style" element={<ModernGhibliStylePage />} />
            <Route path="/features/modern-cartoon-style" element={<ModernCartoonStylePage />} />
            <Route path="/features/modern-batch-generation" element={<ModernBatchGenerationPage />} />
            <Route path="/features/modern-video-converter" element={<ModernVideoConverterPage />} />
            <Route path="/features/gemini-nano-editor" element={<GeminiNanoEditorPage />} />
            <Route path="/gif-editor" element={<GifEditorDemo />} />
            <Route path="/fonts" element={<FontsPage />} />
            <Route path="/tokens" element={<ProtectedRoute><TokensPanel tokens={{}} /></ProtectedRoute>} />
            <Route path="/gemini-docs" element={<GeminiDocs />} />
            <Route path="/debug" element={<ProtectedRoute><EdgeFunctionDebugging /></ProtectedRoute>} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/ai-tools" element={<AIToolsHub />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/features/crazy-image" element={<CrazyImagePage />} />
            <Route path="/freepik-demo" element={<FreepikDemo />} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {isHomePage && <Footer />}
      <PWAInstallPrompt />
    </ErrorBoundary>
  );
};

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
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
    </div>
  );
}

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

function App() {
  return (
    <ThemeProvider>
      <StockImageProvider>
        <AssetProvider>
          <div className="min-h-screen bg-gray-50">
            <AppLayout />
          </div>
        </AssetProvider>
      </StockImageProvider>
    </ThemeProvider>
  );
}

export default App;
