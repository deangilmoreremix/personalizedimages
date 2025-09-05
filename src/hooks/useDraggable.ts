import { useRef, useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableOptions {
  initialPosition?: Position;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null;
}

interface UseDraggableResult {
  position: Position;
  isDragging: boolean;
  ref: React.RefObject<HTMLElement>;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

export function useDraggable(options: DraggableOptions = {}): UseDraggableResult {
  const {
    initialPosition = { x: 0, y: 0 },
    bounds = null
  } = options;
  
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  
  // Keep track of the initial position when dragging starts
  const startDragging = useCallback((clientX: number, clientY: number) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate the offset of the mouse pointer from the top-left corner of the element
    dragOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    setIsDragging(true);
    
    // Add document-level event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', stopDragging);
  }, []);
  
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startDragging(e.clientX, e.clientY);
  }, [startDragging]);
  
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      startDragging(touch.clientX, touch.clientY);
    }
  }, [startDragging]);
  
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    };
    
    if (bounds && ref.current) {
      const width = ref.current.offsetWidth;
      const height = ref.current.offsetHeight;
      
      newPosition.x = Math.max(bounds.left, Math.min(newPosition.x, bounds.right - width));
      newPosition.y = Math.max(bounds.top, Math.min(newPosition.y, bounds.bottom - height));
    }
    
    setPosition(newPosition);
  }, [isDragging, bounds]);
  
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - dragOffset.current.x,
      y: touch.clientY - dragOffset.current.y
    };
    
    if (bounds && ref.current) {
      const width = ref.current.offsetWidth;
      const height = ref.current.offsetHeight;
      
      newPosition.x = Math.max(bounds.left, Math.min(newPosition.x, bounds.right - width));
      newPosition.y = Math.max(bounds.top, Math.min(newPosition.y, bounds.bottom - height));
    }
    
    setPosition(newPosition);
  }, [isDragging, bounds]);
  
  const stopDragging = useCallback(() => {
    setIsDragging(false);
    
    // Remove document-level event listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', stopDragging);
  }, [onMouseMove, onTouchMove]);
  
  return { position, isDragging, ref, onMouseDown, onTouchStart };
}