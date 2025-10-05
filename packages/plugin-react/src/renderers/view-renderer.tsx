/**
 * View Renderer
 * Renders different view types based on semantic configuration
 */

import type { ViewConfig } from '@xflows/core';

interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}

interface Action {
  label: string;
  event: string;
}

export interface ViewRendererProps {
  view: ViewConfig;
  context: Record<string, unknown>;
  onNext: (data?: unknown) => void;
  onBack: (data?: unknown) => void;
  onError: (data?: unknown) => void;
  onCancel: () => void;
}

export function ViewRenderer({ view, onNext, onBack }: ViewRendererProps) {
  switch (view.type) {
    case 'form':
      return <FormRenderer view={view} onNext={onNext} onBack={onBack} />;
    case 'display':
      return <DisplayRenderer view={view} onNext={onNext} onBack={onBack} />;
    case 'loading':
      return <LoadingRenderer view={view} />;
    case 'error':
      return <ErrorRenderer view={view} onNext={onNext} onBack={onBack} />;
    case 'success':
      return <SuccessRenderer view={view} onNext={onNext} onBack={onBack} />;
    default:
      return <div>Unknown view type: {view.type}</div>;
  }
}

// Basic renderers (simplified implementations)
function FormRenderer({ view, onNext, onBack }: { 
  view: ViewConfig; 
  onNext: (data?: unknown) => void; 
  onBack: (data?: unknown) => void; 
}) {
  return (
    <div className="form-renderer">
      <h2>{view.title}</h2>
      {view.subtitle && <p>{view.subtitle}</p>}
      <div className="form-fields">
        {view.fields?.map((field: FormField) => (
          <div key={field.name} className="field">
            <label htmlFor={field.name}>{field.label}</label>
            <input 
              type={field.type} 
              name={field.name}
              id={field.name}
              required={field.required}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
      <div className="form-actions">
        {view.actions?.map((action: Action) => (
          <button 
            type="button"
            key={action.label}
            onClick={() => {
              if (action.event === 'START_DEMO' || action.event === 'SUBMIT_USER_INFO' || action.event === 'SAVE_PREFERENCES') onNext();
              if (action.event === 'GO_BACK' || action.event === 'BACK') onBack();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DisplayRenderer({ view, onNext, onBack }: { 
  view: ViewConfig; 
  onNext: (data?: unknown) => void; 
  onBack: (data?: unknown) => void; 
}) {
  return (
    <div className="display-renderer">
      <h2>{view.title}</h2>
      {view.subtitle && <p>{view.subtitle}</p>}
      {view.message && <p>{view.message}</p>}
      <div className="actions">
        {view.actions?.map((action: Action) => (
          <button 
            type="button"
            key={action.label}
            onClick={() => {
              if (action.event === 'CALL_API') {
                // Send CALL_API event directly to trigger hooks
                onNext(action.event);
              } else if (action.event === 'RESTART_DEMO') {
                onNext();
              }
              if (action.event === 'GO_BACK' || action.event === 'BACK') onBack();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingRenderer({ view }: { view: ViewConfig }) {
  return (
    <div className="loading-renderer">
      <h2>{view.title}</h2>
      <p>{view.message}</p>
    </div>
  );
}

function ErrorRenderer({ view, onNext, onBack }: { 
  view: ViewConfig; 
  onNext: (data?: unknown) => void; 
  onBack: (data?: unknown) => void; 
}) {
  return (
    <div className="error-renderer">
      <h2>{view.title}</h2>
      <p>{view.message}</p>
      <div className="actions">
        {view.actions?.map((action: Action) => (
          <button 
            type="button"
            key={action.label}
            onClick={() => {
              if (action.event === 'RETRY') onNext();
              if (action.event === 'RESET') onBack();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SuccessRenderer({ view, onNext, onBack }: { 
  view: ViewConfig; 
  onNext: (data?: unknown) => void; 
  onBack: (data?: unknown) => void; 
}) {
  return (
    <div className="success-renderer">
      <h2>{view.title}</h2>
      <p>{view.message}</p>
      <div className="actions">
        {view.actions?.map((action: Action) => (
          <button 
            type="button"
            key={action.label}
            onClick={() => {
              if (action.event === 'VIEW_POLICY') onNext();
              if (action.event === 'RESET') onBack();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}