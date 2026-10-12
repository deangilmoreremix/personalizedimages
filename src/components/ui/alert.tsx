import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '', ...props }) => (
  <div
    className={`relative w-full rounded-lg border p-4 text-sm ${className}`}
    role="alert"
    {...props}
  >
    {children}
  </div>
);

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '', ...props }) => (
  <div className={`text-sm [&_ul]:mt-1 ${className}`} {...props}>
    {children}
  </div>
);

export default Alert;
