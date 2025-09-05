import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Star, Award, Globe, Gift, Clock, 
  Shield, Upload, Image, Wand2, Camera, Video,
  FileImage, Mail, Box, MessageSquare, Paintbrush 
} from 'lucide-react';

interface AnimatedIconsProps {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  icons?: Array<{ icon: React.ReactNode; color: string; size: number; }>;
  iconType?: 'default' | 'media' | 'design' | 'mixed';
}

const AnimatedIcons: React.FC<AnimatedIconsProps> = ({
  className = '',
  density = 'medium',
  icons,
  iconType = 'default'
}) => {
  // Default set of icons
  const defaultIcons = [
    <Sparkles className="text-primary-400" />,
    <Zap className="text-secondary-400" />,
    <Star className="text-yellow-400" />,
    <Award className="text-blue-400" />,
    <Globe className="text-green-400" />,
    <Gift className="text-pink-400" />,
    <Clock className="text-indigo-400" />,
    <Shield className="text-red-400" />
  ];

  // Media icons
  const mediaIcons = [
    <Video className="text-blue-400" />,
    <Image className="text-indigo-400" />,
    <Camera className="text-green-400" />,
    <FileImage className="text-purple-400" />,
    <Mail className="text-pink-400" />
  ];

  // Design icons
  const designIcons = [
    <Wand2 className="text-purple-400" />,
    <Paintbrush className="text-indigo-400" />,
    <Box className="text-amber-400" />,
    <MessageSquare className="text-green-400" />
  ];

  // Get icon set based on iconType
  const getIconSet = () => {
    switch(iconType) {
      case 'media': return mediaIcons;
      case 'design': return designIcons;
      case 'mixed': return [...defaultIcons, ...mediaIcons, ...designIcons];
      default: return defaultIcons;
    }
  };

  // Determine number of icons based on density
  const getIconCount = () => {
    switch (density) {
      case 'low': return 5;
      case 'high': return 20;
      case 'medium':
      default: return 12;
    }
  };

  // Generate randomized icon positions
  const generateIconPositions = () => {
    const iconCount = getIconCount();
    const iconSet = getIconSet();
    const positions = [];

    for (let i = 0; i < iconCount; i++) {
      const iconIndex = i % iconSet.length;
      positions.push({
        icon: icons ? icons[i % icons.length].icon : iconSet[iconIndex],
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        size: icons ? icons[i % icons.length].size : Math.random() * 1.5 + 0.5, // 0.5x to 2x size
        delay: Math.random() * 5,
        duration: Math.random() * 20 + 15, // 15-35s duration
        direction: Math.random() > 0.5 ? 1 : -1 // Direction of rotation
      });
    }

    return positions;
  };

  const iconPositions = generateIconPositions();

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {iconPositions.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute opacity-20"
          style={{
            top: icon.y,
            left: icon.x,
            fontSize: `${icon.size}rem`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, icon.direction * 10, 0]
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: icon.duration,
            delay: icon.delay
          }}
        >
          {icon.icon}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedIcons;