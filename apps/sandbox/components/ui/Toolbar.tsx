import React from 'react';

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Toolbar({ children, className = '' }: ToolbarProps) {
  return (
    <div className={`bg-white border-b px-6 py-3 ${className}`}>
      {children}
    </div>
  );
}

interface ToolbarGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolbarGroup({ children, className = '' }: ToolbarGroupProps) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {children}
    </div>
  );
}

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  variant?: 'primary' | 'secondary' | 'debug';
  className?: string;
}

export function ToolbarButton({ 
  children, 
  onClick, 
  active = false, 
  variant = 'primary',
  className = '' 
}: ToolbarButtonProps) {
  const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors';
  
  const variantClasses = {
    primary: active 
      ? 'bg-white text-blue-600 shadow-sm' 
      : 'text-gray-700 hover:text-gray-900',
    secondary: active 
      ? 'bg-white text-blue-600 shadow-sm' 
      : 'text-gray-500 hover:text-gray-700',
    debug: active 
      ? 'bg-white text-blue-600 shadow-sm' 
      : 'text-gray-500 hover:text-gray-700'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

interface ToolbarSeparatorProps {
  className?: string;
}

export function ToolbarSeparator({ className = '' }: ToolbarSeparatorProps) {
  return <div className={`w-px bg-gray-300 mx-1 ${className}`} />;
}
