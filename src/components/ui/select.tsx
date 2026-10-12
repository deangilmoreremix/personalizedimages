import React from 'react';

interface SelectContextValue {
  value: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value = '', onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '', ...props }) => {
  const ctx = React.useContext(SelectContext);
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className}`}
      onClick={() => ctx?.setOpen(!ctx?.open)}
      aria-expanded={ctx?.open}
      {...props}
    >
      {children}
      <svg className="ml-2 h-4 w-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const ctx = React.useContext(SelectContext);
  return <span className={ctx?.value ? 'text-gray-900' : 'text-gray-400'}>{ctx?.value || placeholder}</span>;
};

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className = '', ...props }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx?.open) return null;
  return (
    <div
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className = '', ...props }) => {
  const ctx = React.useContext(SelectContext);
  const selected = ctx?.value === value;
  return (
    <div
      role="option"
      aria-selected={selected}
      className={`relative cursor-pointer select-none px-3 py-2 text-sm ${selected ? 'bg-primary-50 text-primary-900' : 'text-gray-900 hover:bg-gray-100'} ${className}`}
      onClick={() => {
        ctx?.onValueChange?.(value);
        ctx?.setOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Select;
