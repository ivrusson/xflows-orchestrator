import React from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    group?: string;
  }>;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = 'Select...', className = '' }: SelectProps) {
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, typeof options>);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${className}`}
    >
      <option value="">{placeholder}</option>
      {Object.entries(groupedOptions).map(([group, groupOptions]) => (
        <optgroup key={group} label={group === 'default' ? undefined : group}>
          {groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
