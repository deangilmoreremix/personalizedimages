import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabNavigation, { TabType } from './TabNavigation';

interface RightPanelProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  resultContent: React.ReactNode;
  guideContent: React.ReactNode;
  apiContent: React.ReactNode;
  className?: string;
}

const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  onTabChange,
  resultContent,
  guideContent,
  apiContent,
  className = ''
}) => {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {resultContent}
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {guideContent}
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {apiContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RightPanel;
