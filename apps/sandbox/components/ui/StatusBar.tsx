import React from 'react';

interface StatusBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusBar({ children, className = '' }: StatusBarProps) {
  return (
    <div className={`bg-white border-t border-gray-200 px-6 py-2 ${className}`}>
      <div className="flex items-center justify-between text-sm text-gray-600">
        {children}
      </div>
    </div>
  );
}

interface StatusItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusItem({ children, className = '' }: StatusItemProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {children}
    </div>
  );
}

interface StatusLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusLabel({ children, className = '' }: StatusLabelProps) {
  return (
    <span className={`font-medium ${className}`}>
      {children}
    </span>
  );
}

interface StatusValueProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusValue({ children, className = '' }: StatusValueProps) {
  return (
    <span className={`font-mono text-sm ${className}`}>
      {children}
    </span>
  );
}
