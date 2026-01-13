import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Video, Menu, X, ChevronDown, ChevronRight, Zap, Sparkles, Search, Bell, Settings, Edit, Eye, LogIn } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../auth/AuthContext';
import { UserMenu } from '../auth/UserMenu';
import { AuthModal } from '../auth/AuthModal';

const ModernHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, isEditMode, toggleEditMode } = useAdmin();
  const { user } = useAuth();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <motion.div 
              className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white p-2.5 rounded-xl overflow-hidden"
              whileHover={{ 
                scale: 1.05, 
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.5 } 
              }}
            >
              <Video className="h-6 w-6" />
            </motion.div>
            <div className="ml-2.5 flex flex-col">
              <span className="text-2xl font-bold gradient-text">
                VideoRemix
              </span>
              <span className="text-[10px] text-gray-500 -mt-1">Personalized AI Content</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/#features">Features</NavLink>
            <Link to="/how-it-works" className="px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50/80 hover:text-primary-600 font-medium transition-colors">How It Works</Link>
            <Link to="/testimonials" className="px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50/80 hover:text-primary-600 font-medium transition-colors">Testimonials</Link>
            
            {/* Features dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50/80 hover:text-primary-600 font-medium flex items-center">
                Tools
                <ChevronDown className="ml-1 w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute left-0 mt-2 w-60 rounded-xl glass-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="py-2">
                  <DropdownItem
                    to="/features/gemini-nano-editor"
                    icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
                    label="Gemini Nano Editor"
                    description="AI personalization studio"
                  />
                  <DropdownItem
                    to="/features/modern-ai-image"
                    icon={<Sparkles className="w-4 h-4 text-purple-600" />}
                    label="AI Image Creator"
                    description="Generate custom AI imagery"
                  />
                  <DropdownItem
                    to="/features/action-figures"
                    icon={<Zap className="w-4 h-4 text-amber-600" />}
                    label="Action Figure Designer"
                    description="Build custom action figures"
                  />
                  <DropdownItem 
                    to="/features/ghibli-style" 
                    icon={<Sparkles className="w-4 h-4 text-green-600" />}
                    label="Ghibli Style Generator"
                    description="Create magical Ghibli scenes"
                  />
                  <DropdownItem 
                    to="/features/cartoon-style" 
                    icon={<Sparkles className="w-4 h-4 text-blue-600" />}
                    label="Cartoon Style Generator"
                    description="Transform photos into cartoons"
                  />
                  <DropdownItem 
                    to="/features/meme-generator" 
                    icon={<Sparkles className="w-4 h-4 text-pink-600" />}
                    label="Meme Generator"
                    description="Create personalized memes"
                  />
                  <DropdownItem 
                    to="/features/crazy-image" 
                    icon={<Sparkles className="w-4 h-4 text-orange-600" />}
                    label="Crazy Image Generator"
                    description="Generate wild creative images"
                  />
                </div>
              </div>
            </div>

            <Link to="/dashboard" className="animated-underline text-primary-600 hover:text-primary-700 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
              Dashboard
            </Link>
            <Link to="/editor" className="animated-underline text-primary-600 hover:text-primary-700 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
              Editor
            </Link>
            <Link to="/gallery" className="animated-underline text-primary-600 hover:text-primary-700 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
              Gallery
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {isAdmin && (
              <Tooltip content={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}>
                <motion.button
                  onClick={toggleEditMode}
                  className={`px-3 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors ${
                    isEditMode
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle edit mode"
                >
                  {isEditMode ? (
                    <>
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit Mode</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View Mode</span>
                    </>
                  )}
                </motion.button>
              </Tooltip>
            )}

            <Tooltip content="Search">
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </Tooltip>

            {user ? (
              <>
                <Tooltip content="Notifications">
                  <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors relative" aria-label="Notifications">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                </Tooltip>
                <UserMenu />
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={toggleSearch}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search panel */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 mt-2 mx-4 p-4 glass-panel z-50"
            >
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search tools, features, or help..."
                  className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={toggleSearch}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Tooltip content="Quickly navigate to popular sections">
                  <div className="text-sm p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <h4 className="font-medium">Quick Links</h4>
                    <p className="text-xs text-gray-500">Popular destinations</p>
                  </div>
                </Tooltip>
                <Tooltip content="Access help documentation and guides">
                  <div className="text-sm p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <h4 className="font-medium">Documentation</h4>
                    <p className="text-xs text-gray-500">Guides and tutorials</p>
                  </div>
                </Tooltip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden frosted-panel mt-2"
            >
              <div className="py-4 space-y-3">
                <MobileNavLink href="/#features">Features</MobileNavLink>
                <Link to="/how-it-works" className="block py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg">How It Works</Link>
                <Link to="/testimonials" className="block py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg">Testimonials</Link>
                <Link to="/faq" className="block py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg">FAQ</Link>
                
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium mb-2">Tools</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link to="/features/modern-ai-image" className="p-2 rounded hover:bg-gray-50">AI Images</Link>
                    <Link to="/features/action-figures" className="p-2 rounded hover:bg-gray-50">Action Figures</Link>
                    <Link to="/features/ghibli-style" className="p-2 rounded hover:bg-gray-50">Ghibli Style</Link>
                    <Link to="/features/cartoon-style" className="p-2 rounded hover:bg-gray-50">Cartoon Style</Link>
                    <Link to="/features/meme-generator" className="p-2 rounded hover:bg-gray-50">Meme Generator</Link>
                    <Link to="/features/crazy-image" className="p-2 rounded hover:bg-gray-50">Crazy Images</Link>
                  </div>
                </div>
                
                <Link to="/editor" className="block py-3 px-4 rounded-lg bg-primary-50 text-primary-600 font-medium">
                  Editor
                </Link>
                <Link to="/gallery" className="block py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg">
                  Gallery
                </Link>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </header>
  );
};

// Desktop navigation link
const NavLink: React.FC<{ 
  href: string; 
  children: React.ReactNode;
}> = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50/80 hover:text-primary-600 font-medium transition-colors"
    >
      {children}
    </a>
  );
};

// Mobile navigation link
const MobileNavLink: React.FC<{ 
  href: string; 
  children: React.ReactNode; 
}> = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="block py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg"
    >
      {children}
    </a>
  );
};

// Dropdown item
const DropdownItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}> = ({ to, icon, label, description }) => {
  return (
    <Link to={to} className="flex items-start px-4 py-3 hover:bg-gray-50/80 transition-colors">
      <div className="mt-0.5 mr-3">
        {icon}
      </div>
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <ChevronRight className="w-4 h-4 ml-auto text-gray-400 self-center" />
    </Link>
  );
};

export default ModernHeader;