import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Book, Code } from 'lucide-react';

export type TabType = 'result' | 'guide' | 'api';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const tabs: Tab[] = [
    { id: 'result', label: 'My Result', icon: <FileText className="w-4 h-4" /> },
    { id: 'guide', label: 'Guide', icon: <Book className="w-4 h-4" /> },
    { id: 'api', label: 'API', icon: <Code className="w-4 h-4" /> }
  ];

  return (
    <div className={`border-b border-gray-200 bg-white ${className}`}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
