import { assign, createMachine, fromPromise } from 'xstate';

// Versión completamente revisada y funcional
export const simpleWorkingMachine = createMachine({
  initial: 'quickQuote',
  context: {
    dossierId: null as string | null,
    riskScore: 0,
    applicantId: null as string | null,
    signatureId: null as string | null,
    policyId: null as string | null,
    errors: [] as string[],
    session: {
      channel: 'web',
      userId: null as string | null
    },
    results: {} as Record<string, any>
  },
  states: {
    quickQuote: {
      meta: {
        view: { moduleId: '7006-quickquote' },
        description: 'Calculadora de cotización rápida'
      },
      on: {
        QUICKQUOTE_SUBMIT: {
          target: 'riskDecision',
          actions: assign({
            dossierId: () => `document-${Date.now()}`
          })
        },
        CANCEL: 'quickQuote'
      }
    },
    riskDecision: {
      meta: {
        view: { moduleId: 'risk-assessor' },
        description: 'Evaluación manual de riesgo'
      },
      on: {
        CALCULATE_RISK: {
          target: 'riskDecision',
          actions: assign({
            riskScore: () => Math.floor(Math.random() * 100)
          })
        },
        CONTINUE_LOW_RISK: {
          target: 'notifyingProgress2'
        },
        CONTINUE_HIGH_RISK: {
          target: 'highRisk'
        }
      }
    },
    highRisk: {
      meta: {
        view: { moduleId: 'high-risk-screen' },
        description: 'Flujo para alta exposición'
      },
      on: {
        ACCEPT_RISK: 'notifyingProgress2',
        REJECT_RISK: 'quickQuote'
      }
    },
    notifyingProgress2: {
      meta: {
        view: { moduleId: 'loading-screen' },
        description: 'Paso de notificación manual'
      },
      on: {
        NEXT_TO_IDENTITY: 'validatingIdentity',
        SKIP_TO_APPLICANT: 'creatingApplicant'
      }
    },
    validatingIdentity: {
      meta: {
        view: { moduleId: 'identity-validator' },
        description: 'Validación manual de documentos'
      },
      on: {
        VALIDATE_IDENTITY: {
          target: 'creatingApplicant',
          actions: assign({
            applicantId: () => `applicant-val-${Date.now()}`
          })
        },
        FAIL_VALIDATION: 'riskDecision',
        SKIP_TO_SIGNATURE: 'checkingSignature'
      }
    },
    creatingApplicant: {
      meta: {
        view: { moduleId: 'creating-applicant' },
        description: 'Creación manual de solicitante'
      },
      on: {
        CREATE_APPLICANT: {
          target: 'checkingSignature',
          actions: assign({
            applicantId: () => `app-${Date.now()}`
          })
        },
        FAIL_CREATION: 'applicantError',
        JUMP_TO_COMPLETE: 'completed'
      }
    },
    checkingSignature: {
      meta: {
        view: { moduleId: 'signature-checker' },
        description: 'Verificación manual de firmas'
      },
      on: {
        CHECK_SIGNATURE: 'createdSignature',
        FAIL_SIGNATURE: 'signatureError',
        SKIP_TO_FINALIZE: 'finalizingDossier'
      }
    },
    createdSignature: {
      meta: {
        view: { moduleId: 'signature-success' },
        description: 'Confirmación de firma'
      },
      on: {
        SUBMIT_SIGNATURE: {
          target: 'finalizingDossier',
          actions: assign({
            signatureId: () => `sig-${Date.now()}`
          })
        },
        FAIL_SUBMIT: 'signatureError'
      }
    },
    finalizingDossier: {
      meta: {
        view: { moduleId: 'finalizate-dossier' },
        description: 'Finalización manual del dossier'
      },
      on: {
        FINALIZE_DOSSIER: {
          target: 'completed',
          actions: assign({
            policyId: () => `policy-${Date.now()}`
          })
        },
        FAIL_FINALIZE: 'failedDossier'
      }
    },
    completed: {
      type: 'final',
      meta: {
        view: { moduleId: 'success-page' },
        description: 'Proceso completado exitosamente'
      }
    },
    // Estados de error
    saveError: {
      meta: {
        view: { moduleId: 'error-screen' },
        description: 'Error al guardar datos'
      },
      on: {
        RETRY: 'quickQuote',
        EXIT: 'quickQuote'
      }
    },
    applicantError: {
      meta: {
        view: { moduleId: 'error-screen' },
        description: 'Error creando solicitante'
      },
      on: {
        RETRY: 'creatingApplicant',
        EXIT: 'quickQuote'
      }
    },
    signatureError: {
      meta: {
        view: { moduleId: 'error-screen' },
        description: 'Error en proceso de firma'
      },
      on: {
        RETRY: 'checkingSignature',
        EXIT: 'quickQuote'
      }
    },
    failedDossier: {
      meta: {
        view: { moduleId: 'error-screen' },
        description: 'Error finalizando dossier'
      },
      on: {
        RETRY: 'finalizingDossier',
        EXIT: 'quickQuote'
      }
    }
  }
}, {
  guards: {
    isHighRisk: (context: any) => context.riskScore > 80
  }
});