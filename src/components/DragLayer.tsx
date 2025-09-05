import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { ItemTypes, TokenDragItem } from '../types/DragTypes';

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return { display: 'none' };
  }

  const { x, y } = currentOffset;

  // Move element to follow cursor position
  const transform = `translate(${x}px, ${y}px)`;
  
  return {
    transform,
    WebkitTransform: transform,
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: 'auto',
  };
}

/**
 * Custom drag layer to show a preview when dragging tokens
 */
const DragLayer: React.FC = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  // Only render when dragging a token
  if (!isDragging || itemType !== ItemTypes.TOKEN) {
    return null;
  }

  const tokenItem = item as TokenDragItem;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <div 
          className="bg-primary-100 text-primary-700 border border-primary-200 rounded-md py-1 px-2 font-medium shadow-md"
          style={{
            transform: 'scale(1.1)',
            opacity: 0.8,
          }}
        >
          <span className="font-mono">{tokenItem.tokenDisplay}</span>
        </div>
      </div>
    </div>
  );
};

export default DragLayer;