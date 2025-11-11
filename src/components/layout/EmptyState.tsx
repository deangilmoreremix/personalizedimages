import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tips?: string[];
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  tips = [],
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      <div className="w-20 h-20 mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
        <Icon className="w-10 h-10 text-primary-600" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>

      {tips.length > 0 && (
        <div className="w-full max-w-md bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Tips:</h4>
          <ul className="space-y-2 text-left">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
