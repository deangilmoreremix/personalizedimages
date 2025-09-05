import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: React.ReactNode;
  x?: number;
  y?: number;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
  rotationRange?: number;
  opacity?: [number, number];
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  x = 10,
  y = 10,
  delay = 0,
  duration = 3,
  scale = 1,
  rotationRange = 5,
  opacity = [0.7, 1],
  className = ''
}) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ scale }}
      animate={{
        y: [`${-y}px`, `${y}px`, `${-y}px`],
        x: [`${-x}px`, `${x}px`, `${-x}px`],
        rotate: [-rotationRange, rotationRange, -rotationRange],
        opacity: [opacity[0], opacity[1], opacity[0]]
      }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

interface FloatingShapeProps {
  shape: 'circle' | 'square' | 'triangle' | 'blob';
  size?: string;
  color?: string;
  x?: number;
  y?: number;
  delay?: number;
  duration?: number;
  className?: string;
  opacity?: [number, number];
}

export const FloatingShape: React.FC<FloatingShapeProps> = ({
  shape,
  size = '40px',
  color = 'rgba(99, 102, 241, 0.2)',
  x = 10,
  y = 10,
  delay = 0,
  duration = 3,
  className = '',
  opacity = [0.3, 0.7]
}) => {
  const getShapeElement = () => {
    switch (shape) {
      case 'circle':
        return (
          <div 
            className="rounded-full" 
            style={{ width: size, height: size, backgroundColor: color }}
          />
        );
      case 'square':
        return (
          <div 
            className="rounded-lg" 
            style={{ width: size, height: size, backgroundColor: color }}
          />
        );
      case 'triangle':
        return (
          <div 
            style={{ 
              width: 0,
              height: 0,
              borderLeft: `${parseInt(size)/2}px solid transparent`,
              borderRight: `${parseInt(size)/2}px solid transparent`,
              borderBottom: `${size} solid ${color}`
            }}
          />
        );
      case 'blob':
        return (
          <div 
            className="rounded-[40%_60%_70%_30%/40%_50%_60%_50%]" 
            style={{ width: size, height: size, backgroundColor: color }}
          />
        );
      default:
        return (
          <div 
            className="rounded-full" 
            style={{ width: size, height: size, backgroundColor: color }}
          />
        );
    }
  };

  return (
    <FloatingElement 
      x={x}
      y={y}
      delay={delay}
      duration={duration}
      className={className}
      opacity={opacity}
    >
      {getShapeElement()}
    </FloatingElement>
  );
};

interface FloatingElementsGroupProps {
  count?: number;
  types?: ('circle' | 'square' | 'triangle' | 'blob')[];
  colors?: string[];
  sizes?: string[];
  className?: string;
}

const FloatingElementsGroup: React.FC<FloatingElementsGroupProps> = ({
  count = 10,
  types = ['circle', 'square', 'blob'],
  colors = [
    'rgba(99, 102, 241, 0.2)', // primary
    'rgba(79, 70, 229, 0.2)', // secondary
    'rgba(249, 115, 22, 0.2)', // accent
    'rgba(234, 179, 8, 0.15)'  // yellow
  ],
  sizes = ['20px', '30px', '40px', '50px'],
  className = ''
}) => {
  const elements = Array.from({ length: count }).map((_, i) => ({
    shape: types[Math.floor(Math.random() * types.length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.random() * 20 + 5,
    y: Math.random() * 20 + 5,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((el, i) => (
        <FloatingShape 
          key={i}
          shape={el.shape as any}
          size={el.size}
          color={el.color}
          x={el.x}
          y={el.y}
          delay={el.delay}
          duration={el.duration}
          className={`left-[${el.left}%] top-[${el.top}%]`}
        />
      ))}
    </div>
  );
};

