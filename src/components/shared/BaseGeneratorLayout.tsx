import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface BaseGeneratorLayoutProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  className?: string;
}

export const BaseGeneratorLayout: React.FC<BaseGeneratorLayoutProps> = ({
  title,
  icon: Icon,
  description,
  badge,
  leftPanel,
  rightPanel,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {title}
                {badge && (
                  <span className="text-xs px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    {badge}
                  </span>
                )}
              </h2>
              {description && (
                <p className="text-indigo-100 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {leftPanel}
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          {rightPanel}
        </div>
      </div>
    </div>
  );
};

export default BaseGeneratorLayout;
