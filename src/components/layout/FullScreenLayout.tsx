import React from 'react';
import { motion } from 'framer-motion';

interface FullScreenLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({
  leftPanel,
  rightPanel,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="flex flex-col lg:flex-row h-screen pt-16">
        <motion.div
          className="w-full lg:w-[40%] bg-gray-50 overflow-y-auto border-r border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {leftPanel}
        </motion.div>

        <motion.div
          className="w-full lg:w-[60%] bg-white overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {rightPanel}
        </motion.div>
      </div>
    </div>
  );
};

export default FullScreenLayout;
