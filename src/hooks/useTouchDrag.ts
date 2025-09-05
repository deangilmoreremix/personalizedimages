import { useRef, useEffect, useState } from 'react';

interface UseTouchDragOptions {
  onDragStart?: (event: React.TouchEvent | React.MouseEvent) => void;
  onDrag?: (event: TouchEvent | MouseEvent, deltaX: number, deltaY: number) => void;
  onDragEnd?: (event: TouchEvent | MouseEvent, success?: boolean) => void;
}

export function useTouchDrag({
  onDragStart,
  onDrag,
  onDragEnd
}: UseTouchDragOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const dragImageRef = useRef<HTMLElement | null>(null);
  
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    
    if ('touches' in e) {
      // Touch event
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      
      const touch = e.touches[0];
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
    } else {
      // Mouse event
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }
    
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    
    onDrag?.(e, deltaX, deltaY);
  };

  const handleDragEnd = (e: TouchEvent | MouseEvent) => {
    setIsDragging(false);
    
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    
    onDragEnd?.(e);
  };

  useEffect(() => {
    // Clean up event listeners
    return () => {
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  return {
    isDragging,
    handleTouchStart: handleDragStart,
    handleMouseDown: handleDragStart,
    dragImageRef
  };
}