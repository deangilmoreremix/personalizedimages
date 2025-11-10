// Compound Component System for VideoRemix
// Implements Atomic Design principles with flexible composition

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check } from 'lucide-react';
import { DESIGN_SYSTEM, getButtonClasses, getElevationClasses } from './design-system';

// Card Compound Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  interactive?: boolean;
  onClick?: () => void;
}

const CardContext = createContext<{ interactive?: boolean }>({});

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevation = 1,
  interactive = false,
  onClick
}) => {
  const baseClasses = `bg-white rounded-xl border border-gray-100 overflow-hidden ${getElevationClasses(elevation)}`;
  const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-lg transition-shadow' : '';
  const combinedClasses = `${baseClasses} ${interactiveClasses} ${className}`;

  return (
    <CardContext.Provider value={{ interactive }}>
      <motion.div
        className={combinedClasses}
        onClick={onClick}
        whileHover={interactive ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </CardContext.Provider>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', actions }) => (
  <div className={`p-6 pb-4 border-b border-gray-100 flex justify-between items-start ${className}`}>
    <div className="flex-1">{children}</div>
    {actions && <div className="ml-4">{actions}</div>}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  justify = 'between'
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`px-6 py-4 border-t border-gray-100 flex items-center ${justifyClasses[justify]} ${className}`}>
      {children}
    </div>
  );
};

interface CardMediaProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

const CardMedia: React.FC<CardMediaProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'video'
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]'
  };

  return (
    <div className={`overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// Compound component assignments
const CardWithSubcomponents = Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Media: CardMedia,
});

// Modal Compound Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({ isOpen, onClose, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`w-full ${sizeClasses[size]} bg-white rounded-xl shadow-xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, onClose }) => (
  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
    <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
    {onClose && (
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

interface ModalFooterProps {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, justify = 'end' }) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`px-6 py-4 border-t border-gray-200 flex ${justifyClasses[justify]} gap-3`}>
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// Form Compound Component
interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>) => void;
  className?: string;
}

const FormContext = createContext<{
  registerField: (name: string, value: any) => void;
  unregisterField: (name: string, value: any) => void;
  getFormData: () => Record<string, any>;
}>({
  registerField: () => {},
  unregisterField: () => {},
  getFormData: () => ({})
});

const Form: React.FC<FormProps> & {
  Field: React.FC<FormFieldProps>;
  Group: React.FC<FormGroupProps>;
  Actions: React.FC<FormActionsProps>;
} = ({ children, onSubmit, className = '' }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const registerField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const unregisterField = (name: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      delete newData[name];
      return newData;
    });
  };

  const getFormData = () => formData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContext.Provider value={{ registerField, unregisterField, getFormData }}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

interface FormFieldProps {
  name: string;
  label?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  children,
  required = false,
  error
}) => {
  const { registerField, unregisterField } = useContext(FormContext);

  const handleChange = (value: any) => {
    registerField(name, value);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {React.cloneElement(children as React.ReactElement, {
        onChange: handleChange,
        name
      })}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const FormGroup: React.FC<FormGroupProps> = ({ children, title, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <h4 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
        {title}
      </h4>
    )}
    {children}
  </div>
);

interface FormActionsProps {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const FormActions: React.FC<FormActionsProps> = ({ children, justify = 'end' }) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex gap-3 pt-6 border-t border-gray-200 ${justifyClasses[justify]}`}>
      {children}
    </div>
  );
};

Form.Field = FormField;
Form.Group = FormGroup;
Form.Actions = FormActions;

// Select Compound Component
interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> & {
  Option: React.FC<SelectOptionProps>;
} = ({ value, onChange, placeholder = 'Select...', children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const handleSelect = (optionValue: string, optionLabel: string) => {
    onChange(optionValue);
    setSelectedLabel(optionLabel);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex justify-between items-center"
      >
        <span className={selectedLabel ? 'text-gray-900' : 'text-gray-500'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {React.Children.map(children, (child) =>
              React.cloneElement(child as React.ReactElement, {
                onSelect: handleSelect,
                isSelected: (child as React.ReactElement).props.value === value
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SelectOptionProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string, label: string) => void;
  isSelected?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({
  value,
  children,
  onSelect,
  isSelected = false
}) => (
  <button
    type="button"
    onClick={() => onSelect?.(value, children as string)}
    className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex justify-between items-center ${
      isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
    }`}
  >
    {children}
    {isSelected && <Check className="w-4 h-4 text-primary-600" />}
  </button>
);

Select.Option = SelectOption;

// Export all compound components
export {
  CardWithSubcomponents as Card,
  Modal,
  Form,
  Select
};

// Type exports
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardMediaProps,
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  FormProps,
  FormFieldProps,
  FormGroupProps,
  FormActionsProps,
  SelectProps,
  SelectOptionProps
};