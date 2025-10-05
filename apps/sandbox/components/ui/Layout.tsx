import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`flex flex-col h-full bg-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function LayoutHeader({ children, className = '' }: LayoutProps) {
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      {children}
    </header>
  );
}

export function LayoutContent({ children, className = '' }: LayoutProps) {
  return (
    <main className={`flex-1 overflow-hidden ${className}`}>
      {children}
    </main>
  );
}

export function LayoutFooter({ children, className = '' }: LayoutProps) {
  return (
    <footer className={`bg-white border-t border-gray-200 px-6 py-2 ${className}`}>
      {children}
    </footer>
  );
}

export function SplitLayout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`flex h-full ${className}`}>
      {children}
    </div>
  );
}

interface SplitPanelProps {
  children: React.ReactNode;
  className?: string;
  size?: '1/3' | '1/2' | '2/3' | 'flex-1';
}

export function SplitPanel({ children, className = '', size = 'flex-1' }: SplitPanelProps) {
  const sizeClasses = {
    '1/3': 'w-1/3',
    '1/2': 'w-1/2',
    '2/3': 'w-2/3',
    'flex-1': 'flex-1'
  };

  return (
    <div className={`${sizeClasses[size]} border-r border-gray-200 last:border-r-0 ${className}`}>
      {children}
    </div>
  );
}