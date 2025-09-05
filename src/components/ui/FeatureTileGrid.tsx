import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Sparkles, Video } from 'lucide-react';
import FeatureTile from './FeatureTile';
import { useFeatureDialog } from './FeatureDialogProvider';
import { FEATURES } from './FeatureDialogProvider';

interface FeatureTileGridProps {
  categoryFilter?: string | null;
  searchTerm?: string;
}

const FeatureTileGrid: React.FC<FeatureTileGridProps> = ({
  categoryFilter = null,
  searchTerm = ''
}) => {
  const { openFeature, getFeatureConfig } = useFeatureDialog();
  
  // Get all feature configurations
  const allFeatures = Object.keys(FEATURES)
    .map(id => getFeatureConfig(id))
    .filter(Boolean);

  // Filter features based on category and search term
  const filteredFeatures = allFeatures.filter(feature => {
    const matchesCategory = !categoryFilter || feature?.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      feature?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feature?.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  // AI accelerated features
  const aiAcceleratedFeatures = ['image', 'action-figure', 'ghibli', 'cartoon'];
  
  // Premium features
  const premiumFeatures = ['video'];

  return (
    <AnimatePresence mode="wait">
      {filteredFeatures.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="col-span-full py-16 text-center"
        >
          <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No features found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
        >
          {filteredFeatures.map((feature, index) => feature && (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: "easeOut"
                }
              }}
              className="relative"
            >
              {/* AI acceleration badge for faster features */}
              {aiAcceleratedFeatures.includes(feature.id) && (
                <span className="absolute -top-2 -right-2 z-10 bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Accelerated
                </span>
              )}
              
              {/* Premium badge for paid features */}
              {premiumFeatures.includes(feature.id) && (
                <span className="absolute -top-2 -right-2 z-10 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center">
                  <Video className="w-3 h-3 mr-1" />
                  Premium
                </span>
              )}
              
              <FeatureTile
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={
                  feature.category === 'media' 
                    ? 'bg-blue-500' 
                    : feature.category === 'character'
                      ? 'bg-green-500'
                      : 'bg-purple-500'
                }
                onClick={() => openFeature(feature.id)}
                isNew={feature.isNew}
                badge={feature.badge}
                category={feature.category === 'media' 
                  ? 'Media Creation' 
                  : feature.category === 'character'
                    ? 'Character'
                    : 'Style'
                }
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureTileGrid;