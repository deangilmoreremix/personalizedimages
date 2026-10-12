import React from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue = '', value, onValueChange, className = '', children }) => {
  const [internal, setInternal] = React.useState(defaultValue);
  const activeTab = value !== undefined ? value : internal;
  const setActiveTab = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '', ...props }) => (
  <div
    role="tablist"
    className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children?: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '', ...props }) => {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.activeTab === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'} ${className}`}
      onClick={() => ctx?.setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '', ...props }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx?.activeTab !== value) return null;
  return (
    <div role="tabpanel" className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Tabs;
