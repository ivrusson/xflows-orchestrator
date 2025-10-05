import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function Panel({ children, className = '', title, actions }: PanelProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

interface PanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelHeader({ children, className = '' }: PanelHeaderProps) {
  return (
    <div className={`bg-gray-50 border-b border-gray-200 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

interface PanelContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelContent({ children, className = '' }: PanelContentProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
