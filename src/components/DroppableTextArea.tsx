import React, { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes, TokenDragItem } from '../types/DragTypes';
import classNames from 'classnames';
import { motion } from 'framer-motion';

interface DroppableTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onDrop?: (item: TokenDragItem, caretPosition: number) => void;
  highlightOnDragOver?: boolean;
  className?: string;
}

const DroppableTextArea: React.FC<DroppableTextAreaProps> = ({
  onDrop,
  highlightOnDragOver = true,
  className = '',
  ...props
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [dropTargetActive, setDropTargetActive] = useState(false);
  
  // Get the caret position in the text area
  const getCaretPosition = (): number => {
    if (!textAreaRef.current) return 0;
    return textAreaRef.current.selectionStart;
  };
  
  // Set up drop target
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TOKEN,
    drop: (item: TokenDragItem) => {
      // Get current caret position
      const caretPos = getCaretPosition();
      
      // Calculate the drop position from the selection or based on caret position
      if (onDrop) {
        onDrop(item, caretPos);
      } else {
        // Default behavior: insert token at caret position
        if (textAreaRef.current && props.value !== undefined && props.onChange) {
          const value = String(props.value);
          const newValue = value.substring(0, caretPos) + 
                          item.tokenDisplay + 
                          value.substring(caretPos);
          
          // Call onChange with the new value
          const event = {
            target: { value: newValue }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          props.onChange(event);
          
          // Set focus back to textarea and position cursor after the inserted token
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.focus();
              textAreaRef.current.selectionStart = caretPos + item.tokenDisplay.length;
              textAreaRef.current.selectionEnd = caretPos + item.tokenDisplay.length;
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
      <textarea
        ref={(element) => {
          // Connect both refs
          drop(element);
          if (textAreaRef) {
            textAreaRef.current = element;
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

export default DroppableTextArea;