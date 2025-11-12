import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
  CreditCard,
  HelpCircle,
  Activity
} from 'lucide-react';

interface ModernTopHeaderProps {
  title: string;
  breadcrumbs?: { label: string; path?: string }[];
  showBackButton?: boolean;
  backPath?: string;
  serviceStatus?: 'operational' | 'degraded' | 'down';
}

const ModernTopHeader: React.FC<ModernTopHeaderProps> = ({
  title,
  breadcrumbs = [],
  showBackButton = true,
  backPath = '/',
  serviceStatus = 'operational'
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const statusConfig = {
    operational: { color: 'bg-green-500', label: 'All Systems Operational' },
    degraded: { color: 'bg-yellow-500', label: 'Performance Degraded' },
    down: { color: 'bg-red-500', label: 'System Issues' }
  };

  const notifications = [
    { id: 1, text: 'New feature: Gemini Nano support', time: '2h ago' },
    { id: 2, text: 'Batch generation completed', time: '5h ago' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link
              to={backPath}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Back</span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {breadcrumbs.length > 0 ? (
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {crumb.path ? (
                      <Link to={crumb.path} className="text-gray-500 hover:text-gray-700">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-gray-400">/</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            ) : (
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${statusConfig[serviceStatus].color} animate-pulse`} />
            <span className="text-xs text-gray-600">{statusConfig[serviceStatus].label}</span>
          </div>

          <div className="relative">
            <button
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                        <p className="text-sm text-gray-900">{notif.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="hidden md:block p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">john@example.com</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <Activity className="w-4 h-4" />
                      Usage
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      onClick={() => navigate('/')}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernTopHeader;
