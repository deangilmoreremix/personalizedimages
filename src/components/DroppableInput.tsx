import React, { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes, TokenDragItem } from '../types/DragTypes';
import classNames from 'classnames';
import { motion } from 'framer-motion';

interface DroppableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onDrop?: (item: TokenDragItem, caretPosition: number) => void;
  highlightOnDragOver?: boolean;
}

const DroppableInput: React.FC<DroppableInputProps> = ({
  onDrop,
  highlightOnDragOver = true,
  className = '',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropTargetActive, setDropTargetActive] = useState(false);
  
  // Get the caret position in the input
  const getCaretPosition = (): number => {
    if (!inputRef.current) return 0;
    return inputRef.current.selectionStart || 0;
  };
  
  // Set up drop target
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TOKEN,
    drop: (item: TokenDragItem) => {
      // Get current caret position
      const caretPos = getCaretPosition();
      
      // Call the onDrop callback with the item and position
      if (onDrop) {
        onDrop(item, caretPos);
      } else {
        // Default behavior: insert token at caret position
        if (inputRef.current && props.value !== undefined && props.onChange) {
          const value = String(props.value);
          const newValue = value.substring(0, caretPos) + 
                          item.tokenDisplay + 
                          value.substring(caretPos);
          
          // Call onChange with the new value
          const event = {
            target: { value: newValue }
          } as React.ChangeEvent<HTMLInputElement>;
          props.onChange(event);
          
          // Set focus back to input and position cursor after the inserted token
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              inputRef.current.selectionStart = caretPos + item.tokenDisplay.length;
              inputRef.current.selectionEnd = caretPos + item.tokenDisplay.length;
            }
          }, 0);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), [onDrop, props.value, props.onChange]);
  
  // Update active state based on drop hover
  useEffect(() => {
    setDropTargetActive(isOver);
  }, [isOver]);
  
  return (
    <motion.div 
      className="relative"
      animate={dropTargetActive && highlightOnDragOver ? {
        boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.3)",
      } : {}}
      transition={{ duration: 0.2 }}
    >
      <input
        ref={(element) => {
          // Connect both refs
          drop(element);
          if (inputRef) {
            inputRef.current = element;
          }
        }}
        className={classNames(
          'rounded-lg transition-all duration-200 ease-in-out w-full',
          dropTargetActive && highlightOnDragOver ? 'ring-2 ring-purple-300 border-purple-300 bg-purple-50/30' : '',
          className
        )}
        {...props}
      />
      {dropTargetActive && highlightOnDragOver && (
        <motion.div 
          className="absolute inset-0 rounded-lg border-2 border-purple-400 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.01, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity
          }}
        />
      )}
    </motion.div>
  );
};

export default DroppableInput;