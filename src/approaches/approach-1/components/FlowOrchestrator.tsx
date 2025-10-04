import { useMachine } from '@xstate/react';
import { simpleWorkingMachine } from '../simple-working-machine';
import React, { useState, useEffect } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'state_change' | 'event_sent' | 'action' | 'guard' | 'info';
  message: string;
  data?: any;
}

const useLogger = (state: any, event?: any) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  useEffect(() => {
    const now = new Date().toLocaleTimeString();
    
    if (state) {
      const currentState = String(state.value || 'unknown');
      const context = state.context;
      
      // Log state change
      setLogs(prev => [...prev, {
        timestamp: now,
        type: 'state_change',
        message: `🔄 Estado cambiado a: ${currentState}`,
        data: { state: currentState, context }
      }]);
      
      // Log context updates
      if (context.dossierId && !context.dossierId.includes('null')) {
        setLogs(prev => prev.some(log => log.message.includes('dossierId')) ? prev : [...prev, {
          timestamp: now,
          type: 'action',
          message: `📄 Creado dossier: ${context.dossierId}`,
          data: { dossierId: context.dossierId }
        }]);
      }
      
      if (context.riskScore && context.riskScore > 0) {
        setLogs(prev => prev.some(log => log.message.includes('riskScore') && log.message.includes(context.riskScore)) ? prev : [...prev, {
          timestamp: now,
          type: 'action',
          message: `🎯 Risk score calculado: ${context.riskScore}/100`,
          data: { riskScore: context.riskScore }
        }]);
      }
      
      if (context.applicantId && !context.applicantId.includes('null')) {
        setLogs(prev => prev.some(log => log.message.includes('applicantId') && log.message.includes(context.applicantId)) ? prev : [...prev, {
          timestamp: now,
          type: 'action',
          message: `👤 Solicitante creado: ${context.applicantId}`,
          data: { applicantId: context.applicantId }
        }]);
      }
      
      if (context.signatureId && !context.signatureId.includes('null')) {
        setLogs(prev => prev.some(log => log.message.includes('signatureId') && log.message.includes(context.signatureId)) ? prev : [...prev, {
          timestamp: now,
          type: 'action',
          message: `✍️ Firmada por: ${context.signatureId}`,
          data: { signatureId: context.signatureId }
        }]);
      }
      
      if (context.policyId && !context.policyId.includes('null')) {
        setLogs(prev => prev.some(log => log.message.includes('policyId') && log.message.includes(context.policyId)) ? prev : [...prev, {
          timestamp: now,
          type: 'action',
          message: `📋 Póliza generada: ${context.policyId}`,
          data: { policyId: context.policyId }
        }]);
      }
    }
  }, [state]);
  
  return { logs, addEvent: (event: any) => {
    const now = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, {
      timestamp: now,
      type: 'event_sent',
      message: `🚀 Evento enviado: ${event.type}`,
      data: event
    }]);
  }};
};

// Componente de Logs Visuales
const LogsPanel: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'state_change': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'event_sent': return 'bg-green-100 border-green-300 text-green-800';
      case 'action': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'guard': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'info': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'state_change': return '🔄';
      case 'event_sent': return '🚀';
      case 'action': return '⚡';
      case 'guard': return '🛡️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Log de Actividad</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
            Cambios de Estado
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Eventos Enviados
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
            Acciones
          </span>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto border rounded-lg">
        <div className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>Sin actividad aún...</p>
              <p className="text-sm">Presiona algún botón para ver el log en acción</p>
            </div>
          ) : (
            logs.slice().reverse().map((log, index) => (
              <div key={`log-${index}`} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">{getLogIcon(log.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium px-2 py-1 rounded border ${getLogColor(log.type)}`}>
                        {log.message}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">{log.timestamp}</span>
                    </div>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Ver datos técnicos
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Total de eventos: {logs.length}</span>
        <span>Sesión iniciada: {logs.length > 0 ? logs[logs.length - 1].timestamp : 'Pendiente'}</span>
      </div>
    </div>
  );
};

// Componente MockMFE simplificado
const MockMFE: React.FC<{
  moduleId: string;
  description: string;
  onEvent: (event: { type: string; payload?: Record<string, unknown> }) => void;
  currentState: string;
}> = ({ moduleId, description, onEvent, currentState }) => {
  const getFormContent = () => {
    switch (moduleId) {
      case '7006-quickquote':
        return {
          title: '💰 Cotización Rápida de Seguro',
          subtitle: 'Ingresa los datos básicos para tu cotización',
          fields: [
            { label: 'Monto deseado:', value: '$500,000 MXU' },
            { label: 'Tipo de cobertura:', value: 'Vida Completa' },
            { label: 'Edad del interesado:', value: '30 años' }
          ],
          buttons: [
            { text: 'Guardar Cotización', event: 'QUICKQUOTE_SUBMIT', style: 'bg-green-500 hover:bg-green-600' },
            { text: 'Cancelar', event: 'CANCEL', style: 'bg-gray-500 hover:bg-gray-600' }
          ]
        };
      case 'risk-assessor':
        return {
          title: '🛡️ Evaluación de Riesgo',
          subtitle: '¿Quieres calcular el riesgo del cliente?',
          fields: [
            { label: 'Puntuación actual:', value: `${Math.floor(Math.random() * 100)}/100` },
            { label: 'Estado:', value: 'Manual - Pendiente de acción' }
          ],
          buttons: [
            { text: 'Calcular Riesgo', event: 'CALCULATE_RISK', style: 'bg-yellow-500 hover:bg-yellow-600' },
            { text: 'Continuar (Bajo Riesgo)', event: 'CONTINUE_LOW_RISK', style: 'bg-green-500 hover:bg-green-600' },
            { text: 'Ver Alta Exposición', event: 'CONTINUE_HIGH_RISK', style: 'bg-red-500 hover:bg-red-600' }
          ]
        };
      case 'high-risk-screen':
        return {
          title: '⚠️ Alta Exposición Detectada',
          subtitle: 'Se requiere revisión manual del caso',
          fields: [
            { label: 'Puntuación:', value: '85/100' },
            { label: 'Recomendación:', value: 'Revisión manual' }
          ],
          buttons: [
            { text: 'Aceptar Riesgos', event: 'ACCEPT_RISK', style: 'bg-red-500 hover:bg-red-600' },
            { text: 'Rechazar', event: 'REJECT_RISK', style: 'bg-gray-500 hover:bg-gray-600' }
          ]
        };
      case 'loading-screen':
        return {
          title: '⏳ Paso de Procesamiento',
          subtitle: '¿Enviar notificación o continuar?',
          fields: [
            { label: 'Estado:', value: 'Manual - Esperando decisión' },
            { label: 'Progreso:', value: '25% completado' }
          ],
          buttons: [
            { text: 'Ir a Validación ID', event: 'NEXT_TO_IDENTITY', style: 'bg-blue-500 hover:bg-blue-600' },
            { text: 'Saltar a Crear Solicitante', event: 'SKIP_TO_APPLICANT', style: 'bg-green-500 hover:bg-green-600' }
          ]
        };
      case 'success-page':
        return {
          title: '✅ ¡Proceso Completado!',
          subtitle: 'Tu solicitud de seguro ha sido procesada exitosamente',
          fields: [
            { label: 'Número de póliza:', value: '7006-2024-001' },
            { label: 'Estado:', value: 'Aprobada' },
            { label: 'Próximo paso:', value: 'Firma de contrato' }
          ],
          buttons: [
            { text: 'Finalizar', event: 'DONE', style: 'bg-green-500 hover:bg-green-600' }
          ]
        };
      case 'identity-validator':
        return {
          title: '🔍 Validación de Identidad',
          subtitle: '¿Validar documentos o saltar?',
          fields: [
            { label: 'Documentos:', value: 'Pendientes de revisión' },
            { label: 'Estado:', value: 'Manual - Esperando acción' }
          ],
          buttons: [
            { text: 'Validar Identidad', event: 'VALIDATE_IDENTITY', style: 'bg-blue-500 hover:bg-blue-600' },
            { text: 'Falló Validación', event: 'FAIL_VALIDATION', style: 'bg-red-500 hover:bg-red-600' },
            { text: 'Saltar a Firma', event: 'SKIP_TO_SIGNATURE', style: 'bg-green-500 hover:bg-green-600' }
          ]
        };
      case 'creating-applicant':
        return {
          title: '👤 Creando Solicitante',
          subtitle: '¿Crear datos del solicitante?',
          fields: [
            { label: 'Cliente:', value: 'Datos listos para creación' },
            { label: 'Estado:', value: 'Manual - Decision pendiente' }
          ],
          buttons: [
            { text: 'Crear Solicitante', event: 'CREATE_APPLICANT', style: 'bg-green-500 hover:bg-green-600' },
            { text: 'Falló Creación', event: 'FAIL_CREATION', style: 'bg-red-500 hover:bg-red-600' },
            { text: 'Finalizar Directamente', event: 'JUMP_TO_COMPLETE', style: 'bg-purple-500 hover:bg-purple-600' }
          ]
        };
      case 'signature-checker':
        return {
          title: '✍️ Verificación de Firma',
          subtitle: '¿Verificar firmas?',
          fields: [
            { label: 'Firmas:', value: 'Esperando verificación' },
            { label: 'Estado:', value: 'Manual - Acción requerida' }
          ],
          buttons: [
            { text: 'Verificar Firma', event: 'CHECK_SIGNATURE', style: 'bg-blue-500 hover:bg-blue-600' },
            { text: 'Falló Verificación', event: 'FAIL_SIGNATURE', style: 'bg-red-500 hover:bg-red-600' },
            { text: 'Ir a Finalizar', event: 'SKIP_TO_FINALIZE', style: 'bg-green-500 hover:bg-green-600' }
          ]
        };
      case 'signature-success':
        return {
          title: '📝 Firma Confirmada',
          subtitle: '¿Enviar firma o fallar?',
          fields: [
            { label: 'Status:', value: 'Firma lista' },
            { label: 'Estado:', value: 'Manual - Decisión pendiente' }
          ],
          buttons: [
            { text: 'Enviar Firma', event: 'SUBMIT_SIGNATURE', style: 'bg-green-500 hover:bg-green-600' },
            { text: 'Falló Envío', event: 'FAIL_SUBMIT', style: 'bg-red-500 hover:bg-red-600' }
          ]
        };
      case 'finalizate-dossier':
        return {
          title: '📋 Finalizando Dossier',
          subtitle: '¿Completar proceso?',
          fields: [
            { label: 'Póliza:', value: 'Lista para generar' },
            { label: 'Estado:', value: 'Manual - Último paso' }
          ],
          buttons: [
            { text: 'Finalizar Dossier', event: 'FINALIZE_DOSSIER', style: 'bg-green-500 hover:bg-green-600' },
            { text: 'Falló Finalización', event: 'FAIL_FINALIZE', style: 'bg-red-500 hover:bg-red-600' }
          ]
        };
      case 'error-screen':
        return {
          title: '❌ Error Detectado',
          subtitle: 'Se encontró un problema en el proceso',
          fields: [
            { label: 'Error:', value: 'Problema en el flujo' },
            { label: 'Estado:', value: 'Manual - Acción requerida' }
          ],
          buttons: [
            { text: 'Reintentar', event: 'RETRY', style: 'bg-orange-500 hover:bg-orange-600' },
            { text: 'Finalizar', event: 'EXIT', style: 'bg-gray-500 hover:bg-gray-600' }
          ]
        };
      default:
        return {
          title: `📱 ${description}`,
          subtitle: `Módulo: ${moduleId}`,
          fields: [
            { label: 'Estado:', value: 'Manual' },
            { label: 'Servicio:', value: 'Activo' }
          ],
          buttons: [
            { text: 'Continuar', event: 'NEXT', style: 'bg-blue-500 hover:bg-blue-600' }
          ]
        };
    }
  };

  const content = getFormContent();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{content.title}</h3>
          <p className="text-sm text-gray-600">{content.subtitle}</p>
          <p className="text-xs text-gray-500 mt-1">
            Estado: {currentState} | ID: {moduleId}
          </p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {content.fields.map((field, index) => (
            <div key={`field-${moduleId}-${index}`} className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">{field.label}</div>
              <div className="font-medium">{field.value}</div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {content.buttons.map((button, index) => (
            <button 
              key={`btn-${moduleId}-${button.event}`}
              type="button"
              onClick={() => onEvent({ type: button.event })}
              className={`px-4 py-2 text-white rounded transition-colors ${button.style}`}
            >
              {button.text}
            </button>
          ))}
        </div>

        {/* Estado actual y debug info */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-blue-700 font-medium">Estado XState:</div>
              <div className="text-blue-600">{currentState}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">Timestamp:</div>
              <div className="text-blue-600">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FlowOrchestrator: React.FC = () =>
 {
  try {
    const [state, send] = useMachine(simpleWorkingMachine);
    const { logs, addEvent } = useLogger(state);

    // Debug info
    console.log('🎯 XState Status:', state?.value);
    console.log('🎯 XState Context:', state?.context);

    // Función para obtener información del módulo basada en el estado
    const getModuleInfo = () => {
      const currentState = String(state?.value || 'unknown');
      
      switch (currentState) {
        case 'quickQuote':
          return { moduleId: '7006-quickquote', description: 'Cotización rápida', stepName: '💰 Calculadora de cotización' };
        case 'riskDecision':
          return { moduleId: 'risk-assessor', description: 'Evaluación de riesgo', stepName: '🛡️ Evaluación de riesgo' };
        case 'highRisk':
          return { moduleId: 'high-risk-screen', description: 'Alta exposición', stepName: '⚠️ Alta exposición' };
        case 'notifyingProgress2':
          return { moduleId: 'loading-screen', description: 'Procesando', stepName: '⏳ Procesando...' };
        case 'validatingIdentity':
          return { moduleId: 'identity-validator', description: 'Validando identidad', stepName: '🔍 Validación biométrica' };
        case 'creatingApplicant':
          return { moduleId: 'creating-applicant', description: 'Creando solicitante', stepName: '👤 Creando solicitante' };
        case 'checkingSignature':
          return { moduleId: 'signature-checker', description: 'Verificando firma', stepName: '✍️ Verificando firmas' };
        case 'createdSignature':
          return { moduleId: 'signature-success', description: 'Firma creada', stepName: '📝 Firma creada' };
        case 'finalizingDossier':
          return { moduleId: 'finalizate-dossier', description: 'Finalizando', stepName: '📋 Finalizando dossier' };
        case 'completed':
          return { moduleId: 'success-page', description: 'Completado', stepName: '✅ Proceso completado' };
        case 'saveError':
        case 'applicantError':
        case 'signatureError':
        case 'failedDossier':
          return { moduleId: 'error-screen', description: 'Error', stepName: '❌ Error en proceso' };
        default:
          return { moduleId: 'default-screen', description: `Estado: ${currentState}`, stepName: `🔄 ${currentState}` };
      }
    };

    const { moduleId, description, stepName } = getModuleInfo();
    const currentState = String(state?.value || 'unknown');

    // Verificar si es un estado de error o completado
    const isErrorState = currentState.includes('Error') || currentState.includes('error');
    const isCompleted = currentState === 'completed';

    return (
      <div className="max-w-6xl mx-auto">
        {/* Logs Panel - Ahora prominente */}
        <LogsPanel logs={logs} />
        
        {/* Header con estado actual */}
        <div
          className={`rounded-lg p-6 mb-6 ${
            isCompleted
              ? 'bg-green-50 border border-green-200'
              : isErrorState
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                🔄 Approach 1: DSL Completo
              </h2>
              <p className="text-gray-600">
                <strong>Estado actual:</strong> {stepName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                XState Machine completa con guards, acciones y lifecycle hooks
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Sesión</div>
              <div className="font-medium">
                {state?.context?.session?.channel || 'Desconocido'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {String(state?.value || 'unknown')}
              </div>
            </div>
          </div>
        </div>

        {/* MFE Actual - SIEMPRE renderiza algo */}
        <MockMFE
          moduleId={moduleId}
          description={description}
          currentState={currentState}
          onEvent={(event) => {
            console.log('🚀 Enviando evento:', event);
            addEvent(event); // Log del evento antes de enviarlo
            send({ type: event.type, payload: event.payload } as any);
          }}
        />

        {/* Debug info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Estado y eventos */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">🎛️ Estado Debug</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Estado actual:</strong>
                <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                  {String(state?.value || 'undefined')}
                </div>
              </div>
              <div>
                <strong>Tipo de máquina:</strong> {(state as any)?.machine?.id || 'N/A'}
              </div>
              <div>
                <strong>Estado funcionando:</strong>
                <span className="text-green-600 ml-1">✓ Activo</span>
              </div>
            </div>
          </div>

          {/* Contexto */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">📊 Context Data</h3>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(state?.context || {}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">💡 Características Approach 1</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                1. Máquina de estados XState completa
              </div>
              <div className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                2. Lifecycle hooks definidos para cada estado
              </div>
              <div className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                3. Estados explícitos con transiciones claras
              </div>
              <div className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                4. Contexto y acciones totalmente tipadas
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                • Mayor complejidad inicial
              </div>
              <div className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                • Necesita definir todos los estados manualmente
              </div>
              <div className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                • Más código boilerplate
              </div>
              <div className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                • Mayor control pero menos flexibilidad
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error en FlowOrchestrator:', error);
    return (
      <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-3">
              ❌ Error Crítico en FlowOrchestrator
          </h2>
            <p className="text-red-700 mb-3">
              Error al inicializar la máquina de estados: {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer">Detalles técnicos</summary>
              <pre className="mt-2 bg-red-100 p-3 rounded overflow-auto">
                {error instanceof Error ? error.stack : String(error)}
              </pre>
            </details>
          </div>
      </div>
    );
  }
};