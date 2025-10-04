import { assign, createMachine } from 'xstate';

// Tipos para nuestro DSL complejo
export interface FlowContext {
  dossierId: string | null;
  riskScore: number;
  applicantId: string | null;
  signatureId: string | null;
  policyId: string | null;
  errors: string[];
  session: {
    channel: string;
    userId: string | null;
    token?: string;
    user?: Record<string, unknown>;
  };
  results: Record<string, unknown>;
}

export type FlowEvent =
  | { type: 'NEXT'; payload?: Record<string, unknown> }
  | { type: 'BACK' }
  | { type: 'FORM.SUBMIT'; payload: Record<string, unknown> }
  | { type: 'COVERAGE.CHANGE'; payload: Record<string, unknown> }
  | { type: 'ERROR'; error: string };

// Estados principales del canal de ventas
export const salesFlowMachine = createMachine<FlowContext, FlowEvent>(
  {
    id: 'salesFlow',
    initial: 'idle',
    context: {
      dossierId: null,
      riskScore: 0,
      applicantId: null,
      signatureId: null,
      policyId: null,
      errors: [],
      ree: {},
      results: {},
    },
    states: {
      idle: {
        on: {
          NEXT: 'loading',
        },
      },
      quickquote: {
        meta: {
          view: {
            moduleId: '7006-quickquote',
            component: 'QuickQuoteView',
          },
          description: 'Calculadora de cotización rápida',
        },
        invoke: {
          id: 'validateSession',
          src: 'validateSession',
          onError: 'sessionExpired',
        },
        on: {
          'FORM.SUBMIT': {
            target: 'savingQuickquote',
            actions: assign({
              session: (context, event) => ({
                ...context.session,
                quickquote: event.payload,
              }),
            }),
          },
        },
      },
      savingQuickquote: {
        invoke: {
          id: 'saveQuickquote',
          src: 'saveToDossier',
          onDone: [
            {
              target: 'notifyingProgress1',
              actions: assign({
                results: (context, event) => ({
                  ...context.results,
                  quickquote: {
                    ...context.results.quickquote,
                    saveToDossier: event.data,
                  },
                }),
              }),
            },
          ],
          onError: 'saveError',
        },
      },
      notifyingProgress1: {
        invoke: {
          id: 'notify1',
          src: 'notifyProgress',
          onDone: 'underwriting',
          onError: 'underwriting', // Continue even if notification fails
        },
      },
      underwriting: {
        meta: {
          view: {
            moduleId: '7006-underwriting',
            component: 'UnderwritingView',
          },
          description: 'Declaración de salud',
        },
        invoke: {
          id: 'validateSession2',
          src: 'validateSession',
          onError: 'sessionExpired',
        },
        on: {
          'FORM.SUBMIT': {
            target: 'calculatingRisk',
            actions: assign({
              session: (context, event) => ({
                ...context.session,
                underwriting: event.payload,
              }),
            }),
          },
          BACK: 'quickquote',
        },
      },
      calculatingRisk: {
        invoke: [
          {
            id: 'saveUnderwriting',
            src: 'saveUnderwriting',
            onDone: 'calculateRisk',
          },
        ],
      },
      calculateRisk: {
        invoke: {
          id: 'calculateRisk',
          src: 'calculateRisk',
          onDone: [
            {
              target: 'riskDecision',
              actions: assign({
                riskScore: (_, event) => event.data.riskScore,
                results: (context, event) => ({
                  ...context.results,
                  underwriting: {
                    ...context.results.underwriting,
                    calculateRisk: event.data,
                  },
                }),
              }),
            },
          ],
          onError: 'riskCalculationError',
        },
      },
      riskDecision: {
        always: [
          {
            target: 'highRisk',
            guard: 'isHighRisk',
          },
          {
            target: 'notifyingProgress2',
          },
        ],
      },
      highRisk: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Evaluación manual requerida',
        },
        on: {
          BACK: 'underwriting',
        },
      },
      notifyingProgress2: {
        invoke: {
          id: 'notify2',
          src: 'notifyProgress',
          onDone: 'personalData',
          onError: 'personalData',
        },
      },
      personalData: {
        meta: {
          view: {
            moduleId: '7006-personal-data',
            component: 'PersonalDataView',
          },
          description: 'Datos personales',
        },
        on: {
          'FORM.SUBMIT': {
            target: 'validatingIdentity',
            actions: assign({
              session: (context, event) => ({
                ...context.session,
                personalData: event.payload,
              }),
            }),
          },
          BACK: 'underwriting',
        },
      },
      validatingIdentity: {
        invoke: {
          id: 'validateIdentity',
          src: 'validateIdentity',
          onDone: 'creatingApplicant',
          onError: 'riskDecision',
        },
      },
      creatingApplicant: {
        invoke: [
          {
            id: 'savePersonalData',
            src: 'savePersonalData',
            onDone: 'createApplicant',
          },
        ],
      },
      createApplicant: {
        invoke: {
          id: 'createApplicant',
          src: 'createApplicant',
          onDone: [
            {
              target: 'notifyingProgress3',
              actions: assign({
                applicantId: (_, event) => event.data.applicantId,
                results: (context, event) => ({
                  ...context.results,
                  personalData: {
                    ...context.results.personalData,
                    createApplicant: event.data,
                  },
                }),
              }),
            },
          ],
          onError: 'applicantError',
        },
      },
      notifyingProgress3: {
        invoke: {
          id: 'notify3',
          src: 'notifyProgress',
          onDone: 'benefits',
          onError: 'benefits',
        },
      },
      benefits: {
        meta: {
          view: {
            moduleId: '7006-benefits',
            component: 'BenefitsView',
          },
          description: 'Beneficiarios',
        },
        on: {
          'COVERAGE.CHANGE': {
            actions: assign({
              session: (context, event) => ({
                ...context.session,
                benefits: {
                  ...context.session.benefits,
                  beneficiaries: event.payload.beneficiaries,
                },
              }),
            }),
          },
          NEXT: {
            target: 'validatingBenefits',
            guard: 'hasValidPercentages',
          },
          BACK: 'personalData',
        },
      },
      validatingBenefits: {
        invoke: [
          {
            id: 'validateBeneficiaries',
            src: 'validateBeneficiaries',
            onDone: 'savingBenefits',
          },
        ],
      },
      savingBenefits: {
        invoke: {
          id: 'saveBenefits',
          src: 'saveBenefits',
          onDone: 'notifyingProgress4',
          onError: 'saveError',
        },
      },
      notifyingProgress4: {
        invoke: {
          id: 'notify4',
          src: 'notifyProgress',
          onDone: 'signature',
          onError: 'signature',
        },
      },
      signature: {
        meta: {
          view: {
            moduleId: '7006-signature',
            component: 'SignatureView',
          },
          description: 'Firma electrónica',
        },
        on: {
          'FORM.SUBMIT': {
            target: 'submittingSignature',
            actions: assign({
              session: (context, event) => ({
                ...context.session,
                signature: event.payload,
              }),
            }),
          },
          BACK: 'benefits',
        },
      },
      submittingSignature: {
        invoke: {
          id: 'submitSignature',
          src: 'submitSignature',
          onDone: 'finalizingDossier',
          onError: 'signatureError',
        },
      },
      finalizingDossier: {
        invoke: {
          id: 'finalizeDossier',
          src: 'finalizeDossier',
          onDone: [
            {
              target: 'sendingConfirmation',
              actions: assign({
                policyId: (_, event) => event.data.policyId,
                results: (context, event) => ({
                  ...context.results,
                  signature: {
                    ...context.results.signature,
                    finalizeDossier: event.data,
                  },
                }),
              }),
            },
          ],
          onError: 'failedDossier',
        },
      },
      loading: {
        invoke: {
          id: 'sendConfirmation',
          src: 'sendConfirmation',
          onDone: 'completed',
        },
      },
      completed: {
        meta: {
          view: {
            moduleId: 'completion',
            component: 'CompletionPage',
          },
          description: 'Proceso completado',
        },
        type: 'final',
      },
      // Estados de error
      error: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Error del sistema',
        },
      },
      sessionExpired: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Sesión expirada',
        },
        on: {
          RETRY: 'loading',
        },
      },
      saveError: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Error al guardar',
        },
        on: {
          RETRY: 'loading',
          BACK: 'idle',
        },
      },
      riskCalculationError: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Identidad no verificada',
        },
        on: {
          BACK: 'personalData',
        },
      },
      applicantError: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Error al crear perfil',
        },
        on: {
          RETRY: 'creatingApplicant',
          BACK: 'personalData',
        },
      },
      signatureError: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Error en firma',
        },
        on: {
          RETRY: 'signature',
          BACK: 'benefits',
        },
      },
      failedDossier: {
        meta: {
          view: {
            moduleId: 'error-page',
            component: 'ErrorPage',
          },
          description: 'Error al finalizar',
        },
        on: {
          BACK: 'loading',
        },
      },
      sendingConfirmation: {
        invoke: {
          id: 'sendConfirmation',
          src: 'sendConfirmation',
          onDone: {
            target: 'completed',
            actions: assign({
              state: 'SUCCESS',
            }),
          },
          onError: 'saveError',
        },
      },
    },
    guards: {
      isHighRisk: (context) => context.riskScore > 80,
      hasValidPercentages: (context) => {
        const beneficiaries = context.session.benefits?.beneficiaries || [];
        const totalPercentage = beneficiaries.reduce(
          (sum: number, b: Record<string, unknown>) => sum + (Number(b.percentage) || 0),
          0
        );
        return totalPercentage === 100;
      },
    },
    actors: {
      initializeFlow: async () => {
        // Mock initialization
        return { dossierId: `document-${Date.now()}` };
      },
      validateSession: async () => {
        // Mock session validation
        return true;
      },
      saveToĐossier: async () => {
        // Mock save
        return { status: 'success', timestamp: Date.now() };
      },
      notifyProgress: async () => {},
      saveUnderwriting: async () => {
        return { status: 'success' };
      },
      calculateRisk: async () => {
        // Mock risk calculation
        return {
          riskScore: Math.floor(Math.random() * 100),
          riskFactors: ['age', 'medical_history'],
        };
      },
      validateIdentity: async () => {
        return { valid: true, matchScore: 95 };
      },
      savePersonalData: async () => {
        return { status: 'success' };
      },
      createApplicant: async () => {
        return {
          applicantId: `applicant-${Date.now()}`,
          createdAt: Date.now(),
        };
      },
      validateBeneficiaries: async () => {
        return { valid: true, warnings: [] };
      },
      saveBenefits: async () => {
        return { status: 'success' };
      },
      submitSignature: async () => {
        return {
          signatureId: `signature-${Date.now()}`,
          timestamp: Date.now(),
        };
      },
      finalizeDossier: async () => {
        return {
          policyId: `policy-${Date.now()}`,
          status: 'completed',
        };
      },
      sendConfirmation: async () => {},
    },
  }
);
