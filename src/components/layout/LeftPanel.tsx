import React from 'react';
import { motion } from 'framer-motion';

interface LeftPanelProps {
  children: React.ReactNode;
  className?: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ children, className = '' }) => {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {children}
    </div>
  );
};

interface LeftPanelSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const LeftPanelSection: React.FC<LeftPanelSectionProps> = ({
  title,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      {title && (
        <button
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
          className={`w-full px-6 py-4 text-left flex items-center justify-between ${
            collapsible ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
          }`}
        >
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {collapsible && (
            <motion.svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          )}
        </button>
      )}
      {(!collapsible || isExpanded) && (
        <motion.div
          initial={collapsible ? { opacity: 0, height: 0 } : false}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 py-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

interface LeftPanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const LeftPanelFooter: React.FC<LeftPanelFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`mt-auto border-t border-gray-200 bg-white p-6 ${className}`}>
      {children}
    </div>
  );
};

export default LeftPanel;
