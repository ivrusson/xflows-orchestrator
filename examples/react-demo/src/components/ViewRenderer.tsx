import React, { useState } from 'react';
import { ViewConfig } from '@xflows/core';

interface ViewRendererProps {
  view: ViewConfig | undefined;
  context: any;
  onNext: (data?: any) => void;
  onBack: () => void;
  onEvent: (event: string, data?: any) => void;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({
  view,
  context,
  onNext,
  onBack,
  onEvent
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!view) {
    return (
      <div className="xflows-loading">
        Loading...
      </div>
    );
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (view.fields) {
      view.fields.forEach(field => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
        
        if (field.validation) {
          const value = formData[field.name];
          if (value && field.validation.minLength && value.length < field.validation.minLength) {
            newErrors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
          }
          if (value && field.validation.maxLength && value.length > field.validation.maxLength) {
            newErrors[field.name] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
          }
          if (value && field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
            newErrors[field.name] = `${field.label} format is invalid`;
          }
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.event === 'GO_BACK') {
      onBack();
    } else if (action.event === 'START_DEMO' || action.event === 'RESTART_DEMO') {
      onNext();
    } else if (action.event === 'CALL_API') {
      onEvent(action.event);
    } else {
      onEvent(action.event, formData);
    }
  };

  const renderField = (field: any) => (
    <div key={field.name} className="field-group">
      <label htmlFor={field.name}>
        {field.label}
        {field.required && <span style={{ color: '#ff6b6b' }}> *</span>}
      </label>
      
      {field.type === 'text' || field.type === 'email' ? (
        <input
          id={field.name}
          type={field.type}
          placeholder={field.placeholder}
          value={formData[field.name] || ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className={errors[field.name] ? 'error' : ''}
        />
      ) : field.type === 'select' ? (
        <select
          id={field.name}
          value={formData[field.name] || ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className={errors[field.name] ? 'error' : ''}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData[field.name] || false}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
          />
          {field.label}
        </label>
      ) : field.type === 'textarea' ? (
        <textarea
          id={field.name}
          placeholder={field.placeholder}
          rows={field.rows || 4}
          value={formData[field.name] || ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className={errors[field.name] ? 'error' : ''}
        />
      ) : null}
      
      {errors[field.name] && (
        <div className="field-error">{errors[field.name]}</div>
      )}
    </div>
  );

  return (
    <div className="view-container">
      {view.title && <h2>{view.title}</h2>}
      {view.subtitle && <h3>{view.subtitle}</h3>}
      {view.message && <p className="view-message">{view.message}</p>}
      
      {view.type === 'form' ? (
        <form onSubmit={handleSubmit} className="xflows-form">
          {view.fields?.map(renderField)}
          <div className="xflows-buttons">
            {view.actions?.map((action, index) => (
              <button
                key={index}
                type={action.type === 'submit' ? 'submit' : 'button'}
                className={`xflows-button ${action.type === 'button' ? 'secondary' : ''}`}
                onClick={action.type === 'button' ? () => handleActionClick(action) : undefined}
              >
                {action.label}
              </button>
            ))}
          </div>
        </form>
      ) : (
        <div className="display-view">
          <div className="xflows-buttons">
            {view.actions?.map((action, index) => (
              <button
                key={index}
                type="button"
                className={`xflows-button ${action.label.includes('Back') ? 'secondary' : ''}`}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRenderer;
