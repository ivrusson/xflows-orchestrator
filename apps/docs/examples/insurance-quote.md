# 🏢 Insurance Quote Flow Example

A comprehensive example demonstrating enterprise-grade flow orchestration for an insurance quote application.

## 📋 Overview

**Purpose**: Build a complete insurance quote flow with risk assessment, coverage selection, and quote generation  
**Duration**: 30-45 minutes  
**Complexity**: Advanced  
**Technologies**: React, TypeScript, REST APIs, Form validation

## 🎯 Business Requirements

Our insurance quote flow needs to:

1. **Collect applicant information** (personal, contact, vehicle)
2. **Perform risk assessment** (driver history, vehicle safety, location)  
3. **Calculate premium** (risk-based pricing, coverage options)
4. **Generate quote** (policy options, premium breakdown)
5. **Handle errors gracefully** (validation failures, service timeouts)

## 🔧 Implementation

### Flow Definition

Create `flows/insurance-quote.json`:

```json
{
  "id": "insurance-quote",
  "initial": "personal-info",
  "context": {
    "applicant": {
      "personal": {},
      "contact": {},
      "drivingHistory": {}
    },
    "vehicle": {
      "details": {},
      "safety": {}
    },
    "coverage": {
      "selectedOptions": {},
      "limits": {}
    },
    "quote": {
      "premiums": {},
      "breakdown": {}
    },
    "session": {
      "startTime": "",
      "riskIndex": 0
    },
    "errors": {}
  },
  "states": {
    "personal-info": {
      "view": {
        "moduleId": "applicant-form",
        "slot": "main-content"
      },
      "on": {
        "NEXT": {
          "target": "vehicle-info",
          "actions": [
            {
              "type": "assign",
              "to": "applicant.personal",
              "fromEventPath": "payload.personal"
            },
            {
              "type": "assign", 
              "to": "applicant.contact",
              "fromEventPath": "payload.contact"
            },
            {
              "type": "track",
              "event": "Personal Info Submitted",
              "props": {
                "step": "personal-info",
                "hasPhone": "payload.contact.phone !== ''"
              }
            }
          ]
        }
      }
    },
    
    "vehicle-info": {
      "view": {
        "moduleId": "vehicle-form", 
        "slot": "main-content"
      },
      "on": {
        "NEXT": {
          "target": "driving-history",
          "actions": [
            {
              "type": "assign",
              "degrees": "vehicle.details",
              "fromEventPath": "payload"
            }
          ]
        },
        "BACK": "personal-info"
      }
    },
    
    "driving-history": {
      "view": {
        "moduleId": "driving-history-form",
        "slot": "main-content"
      },
      "on": {
        "SUBMIT_HISTORY": {
          "target": "risk-assessment",
          "actions": [
            {
              "type": "assign",
              "to": "applicant.drivingHistory",
              "fromEventPath": "payload"
            },
            {
              "type": "track",
              "event": "Driving History Submitted",
              "props": {
                "violationsCount": "payload.violations.length",
                "accidentsCount": "payload.accidents.length"
              }
            }
          ]
        },
        "BACK": "vehicle-info"
      }
    },
    
    "risk-assessment": {
      "view": {
        "moduleId": "risk-assessment",
        "slot": "main-content"
      },
      "invoke": [
        {
          "id": "calculate-risk",
          "type": "risk-calculator",
          "config": {
            "applicantData": "{{context.applicant}}",
            "vehicleData": "{{context.vehicle}}",
            "drivingHistory": "{{context.applicant.drivingHistory}}"
          },
          "assignTo": "session.riskIndex"
        }
      ],
      "on": {
        "RISK_CALCULATED": {
          "target": "coverage-selection",
          "actions": [
            {
              "type": "track",
              "event": "Risk Assessment Complete",
              "props": {
                "riskIndex": "{{context.session.riskIndex}}",
                "riskLevel": "{{context.session.riskIndex > 0.7 ? 'high' : context.session.riskIndex > 0.4 ? 'medium' : 'low'}}"
              }
            }
          ]
        }
      },
      "onError": {
        "target": "error-state",
        "actions": [
          {
            "type": "assign",
            "to": "errors.riskAssessment",
            "fromEventPath": "error"
          }
        ]
      }
    },
    
    "coverage-selection": {
      "view": {
        "moduleId": "coverage-options",
        "slot": "main-content"
      },
      "on": {
        "COVERAGE_SELECTED": {
          "target": "quote-generation",
          "actions": [
            {
              "type": "assign",
              "to": "coverage.selectedOptions",
              "fromEventPath": "payload.coverage"
            },
            {
              "type": "assign",
              "to": "coverage.limits",
              "fromEventPath": "payload.limits"
            }
          ]
        },
        "BACK": "risk-assessment"
      }
    },
    
    "quote-generation": {
      "view": {
        "moduleId": "loading-quote",
        "slot": "main-content"
      },
      "invoke": [
        {
          "id": "generate-quote",
          "type": "quote-generator",
          "config": {
            "riskIndex": "{{context.session.riskIndex}}",
            "coverageOptions": "{{context.coverage.selectedOptions}}",
            "coverageLimits": "{{context.coverage.limits}}",
            "vehicleData": "{{context.vehicle}}",
            "applicantData": "{{context.applicant}}"
          },
          "assignTo": "quote.premiums"
        }
      ],
      "onDone": {
        "target": "quote-review",
        "actions": [
          {
            "type": "assign",
            "to": "quote.breakdown",
            "fromEventPath": "data"
          },
          {
            "type": "track",
            "event": "Quote Generated",
            "props": {
              "totalPremium": "{{data.totalPremium}}",
              "riskIndex": "{{context.session.riskIndex}}",
              "coverageTypes": "{{data.coverageTypes}}"
            }
          }
        ]
      },
      "onError": {
        "target": "quote-error",
        "actions": [
          {
            "type": "assign",
            "to": "errors.quoteGeneration",
            "fromEventPath": "error"
          }
        ]
      }
    },
    
    "quote-review": {
      "view": {
        "moduleId": "quote-summary",
        "slot": "main-content"
      },
      "on": {
        "ACCEPT_QUOTE": {
          "target": "payment-processing",
          "actions": [
            {
              "type": "track",
              "event": "Quote Accepted",
              "props": {
                "finalPremium": "{{context.quote.premiums.total}}"
              }
            }
          ]
        },
        "MODIFY_COVERAGE": "coverage-selection",
        "START_OVER": "personal-info"
      }
    },
    
    "payment-processing": {
      "view": {
          "moduleId": "payment-form",
          "slot": "main-content"
      },
      "invoke": [
        {
          "id": "process-payment",
          "type": "payment-processor",
          "config": {
            "amount": "{{context.quote.premiums.total}}",
            "currency": "USD",
            "customerData": "{{context.applicanten}}"
          }
        }
      ],
      "onDone": {
        "target": "success",
        "actions": [
          {
            "type": "track",
            "event": "Payment Successful",
            "props": {
              "transactionId": "{{data.transactionId}}",
              "quoteId": "{{context.quote.id}}"
            }
          }
        ]
      },
      "onError": {
        "target": "payment-error",
        "actions": [
          {
            "type": "assign",
            "to": "errors.payment",
            "fromEventPath": "error"
          }
        ]
      }
    },
    
    "payment-error": {
      "view": {
        "moduleId": "payment-error",
        "slot": "main-content"
      },
      "on": {
        "RETRY_PAYMENT": "payment-processing",
        "MODIFY_PAYMENT": "quote-review",
        "CANCEL": "quote-review"
      }
    },
    
    "quote-error": {
      "view": {
        "moduleId": "quote-error",
        "slot": "main-content"
      },
      "on": {
        "RETRY": "quote-generation",
        "START_OVER": "personal-info"
      }
    },
    
    "error-state": {
      "view": {
        "moduleId": "generic-error",
        "slot": "main-content"
      },
      "on": {
        "RETRY": "risk-assessment",
        "START_OVER": "personal-info"
      }
    },
    
    "success": {
      "type": "final",
      "view": {
        "moduleId": "policy-confirmation",
        "slot": "main-content"
      }
    }
  }
}
```

### Component Implementation

#### Insurance Quote Form Component

```tsx
// components/ApplicantForm.tsx
import React, { useState } from 'react';

interface ApplicantData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export const ApplicantForm: React.FC<ViewProps> = ({ nodeId, send }) => {
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!personalData.firstName) newErrors.firstName = 'First name is required';
    if (!personalData.lastName) newErrors.lastName = 'Last name is required';
    if (!contactData.email) newErrors.email = 'Email is required';
    if (!contactData.phone) newErrors.phone = 'Phone is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactData.email && !emailRegex.test(contactData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      send({
        type: 'NEXT',
        payload: {
          personal: personalData,
          contact: contactData
        }
      });
    }
  };

  return (
    <div className="insurance-quote-form">
      <h2>Personal Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Details</h3>
          
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={personalData.firstName}
              onChange={(e) => setPersonalData({
                ...personalData,
                firstName: e.target.value
              })}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={personalData.lastName}
              onChange={(e) => setPersonalData({
                ...personalData,
                lastName: e.target.value
              })}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              type="date"
              value={personalData.dateOfBirth}
              onChange={(e) => setPersonalData({
                ...personalData,
                dateOfBirth: e.target.value
              })}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              value={contactData.email}
              onChange={(e) => setContactData({
                ...contactData,
                email: e.target.value
              })}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              value={contactData.phone}
              onChange={(e) => setContactData({
                ...contactData,
                phone: e.target.value
              })}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input
              id="street"
              type="text"
              value={contactData.address.street}
              onChange={(e) => setContactData({
                ...contactData,
                address: {
                  ...contactData.address,
                  street: e.target.value
                }
              })}
            />
          </div>
          
          <div className="address-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                value={contactData.address.city}
                onChange={(e) => setContactData({
                  ...contactData,
                  address: {
                    ...contactData.address,
                    city: e.target.value
                  }
                })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                value={contactData.address.state}
                onChange={(e) => setContactData({
                  ...contactData,
                  address: {
                    ...contactData.address,
                    state: e.target.value
                  }
                })}
              >
                <option value="">Select State</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                {/* ... more states */}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                id="zipCode"
                type="text"
                value={contactData.address.zipCode}
                onChange={(e) => setContactData({
                  ...contactData,
                  address: {
                    ...contactData.address,
                    zipCode: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Continue to Vehicle Information
          </button>
        </div>
      </form>
    </div>
  );
};
```

#### Risk Assessment Component

```tsx
// components/RiskAssessment.tsx
export const RiskAssessment: React.FC<ViewProps> = ({ nodeId, contextSlice }) => {
  const { session } = contextSlice;
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    // Simulate risk calculation
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getRiskLevel = (riskIndex: number) => {
    if (riskIndex > 0.7) return { level: 'High', color: 'red', icon: '' };
    if (riskIndex > 0.4) return { level: 'Medium', color: 'orange', icon: '' };
    return { level: 'Low', color: 'green', icon: '' };
  };

  if (isCalculating) {
    return (
      <div className="risk-assessment-calculation">
        <div className="loading-spinner" />
        <h3>Calculating Your Risk Profile</h3>
        <p>Analyzing your driving history, location, and vehicle information...</p>
        
        <div className="calculation-steps">
          <div className="step completed">
            <span className="step-icon">✓</span>
            <span>Personal Information</span>
          </div>
          <div className="step completed">
            <span className="step-icon">✓</span>
            <span>Vehicle Details</span>
          </div>
          <div className="step active">
            <span className="step-icon loading">⟳</span>
            <span>Risk Analysis</span>
          </div>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskLevel(session.riskIndex);

  return (
    <div className="risk-assessment-results">
      <h2>Your Risk Assessment</h2>
      
      <div className="risk-summary">
        <div className={`risk-level ${riskInfo.color}`}>
          <span className="risk-icon">{riskInfo.icon}</span>
          <h3>Risk Level: {riskInfo.level}</h3>
          <div className="risk-score">
            Score: {(session.riskIndex * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="risk-factors">
          <h4>Factors Considered:</h4>
          <ul>
            <li>✓ Driving history and violations</li>
            <li>✓ Vehicle safety ratings</li>
            <li>✓ Geographic location</li>
            <li>✓ Credit history (where permitted)</li>
          </ul>
        </div>
      </div>
      
      <div className="assessment-actions">
        <button 
          className="btn-primary"
          onClick={() => send({ type: 'RISK_CALCULATED' })}
        >
          Continue to Coverage Options
        </button>
      </div>
    </div>
  );
};
```

### Service Implementation

#### Risk Calculator Service

```typescript
// services/RiskCalculator.ts
export interface RiskFactors {
  age: number;
  drivingExperience: number;
  violations: Array<{ type: string; date: string }>;
  accidents: Array<{ severity: string; atFault: boolean }>;
  vehicleYear: number;
  vehicleSafetyRating: number;
  location: {
    state: string;
    urbanDensity: number;
    crimeRate: number;
  };
}

export async function calculateRiskScore(data: RiskFactors): Promise<number> {
  try {
    // Call external risk assessment API
    const response = await fetch('/api/risk-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Risk assessment failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.riskScore;
    
  } catch (error) {
    console.error('Risk calculation error:', error);
    // Fallback to client-side calculation
    return calculateRiskScoreFallback(data);
  }
}

function calculateRiskScoreFallback(data: RiskFactors): number {
  let score = 0.5; // Base risk score
  
  // Age factor (0-100 years mapped to 0.2-0.8 risk)
  const ageFactor = Math.max(0.2, Math.min(0.8, data.age / 50));
  score = (score + ageFactor) / 2;
  
  // Violation factor
  if (data.violations.length > 0) {
    score += data.violations.length * 0.1;
  }
  
  // Accident factor
  data.accidents.forEach(accident => {
    score += accident.atFault ? 0.15 : 0.05;
    score += accident.severity === 'major' ? 0.1 : 0.05;
  });
  
  // Vehicle safety factor
  score += (10 - data.vehicleSafetyRating) * 0.02;
  
  // Location factor
  score += data.location.urbanDensity * 0.01;
  
  return Math.max(0.1, Math.min(0.9, score));
}

// Service registry entry
export const riskCalculatorService = async (config: any, context: any) => {
  const riskFactors: RiskFactors = {
    age: calculateAge(context.applicant.personal.dateOfBirth),
    drivingExperience: calculateDrivingExperience(context.applicant.drivingHistory),
    violations: context.applicant.drivingHistory.violations || [],
    accidents: context.applicant.drivingHistory.accidents || [],
    vehicleYear: context.vehicle.details.year,
    vehicleSafetyRating: context.vehicle.safety.rating,
    location: {
      state: context.applicant.contact.address.state,
      urbanDensity: 0.7, // Would come from external data
      crimeRate: 0.3     // Would come from external data
    }
  };
  
  return await calculateRiskScore(riskFactors);
};
```

## 🧪 Testing

### Unit Tests

```typescript
// tests/InsuranceQuote.test.ts
import { createHeadlessHost } from '@xflows/core';
import insuranceFlow from './insurance-quote.json';

describe('Insurance Quote Flow', () => {
  let host: any;

  beforeEach(() => {
    host = createHeadlessHost(insuranceFlow, {
      services: {
        'risk-calculator': jest.fn().mockResolvedValue(0.6),
        'quote-generator': jest.fn().mockResolvedValue({
          totalPremium: 1200,
          monthlyPremium: 100,
          coverageTypes: ['liability', 'comprehensive']
        }),
        'payment-processor': jest.fn().mockResolvedValue({
          transactionId: 'txn_123456',
          status: 'success'
        })
      },
      apis: {
        lifecycle: { enter: jest.fn(), leave: jest.fn() },
        readFrom: (event, path) => path ? event.path?.split('.').reduce((a,k) => a?.[k], event) : event,
        track: jest.fn()
      }
    });
  });

  describe('Personal Information Step', () => {
    it('should transition to vehicle info when valid data submitted', () => {
      expect(host.actor.getSnapshot().value).toBe('personal-info');
      
      host.send({
        type: 'NEXT',
        payload: {
          personal: { firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
          contact: { email: 'john@example.com', phone: '555-1234' }
        }
      });
      
      expect(host.actor.getSnapshot().value).toBe('vehicle-info');
      expect(host.actor.getSnapshot().context.applicant.personal.firstName).toBe('John');
    });

    it('should trigger analytics tracking', () => {
      const mockTrack = jest.fn();
      host.send({
        type: 'NEXT',
        payload: {
          personal: { firstName: 'John', lastName: 'Doe' },
          contact: { email: 'john@example.com', phone: '555-1234' }
        }
      });
      
      expect(mockTrack).toHaveBeenCalledWith(
        'Personal Info Submitted',
        expect.objectContaining({
          step: 'personal-info',
          hasPhone: true
        })
      );
    });
  });

  describe('Risk Assessment', () => {
    beforeEach(() => {
      // Navigate to risk assessment step
      host.send({ type: 'NEXT', payload: mockApplicantData });
      host.send({ type: 'SUBMIT_HISTORY', payload: mockDrivingHistory });
    });

    it('should calculate risk score correctly', async () => {
      expect(host.actor.getSnapshot().value).toBe('risk-assessment');
      
      // Wait for async risk calculation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(host.actor.getSnapshot().context.session.riskIndex).toBe(0.6);
    });

    it('should handle risk calculation errors', async () => {
      // Mock service failure
      const errorHost = createHeadlessHost(insuranceFlow, {
        ...mockDeps,
        services: {
          ...mockDeps.services,
          'risk-calculator': jest.fn().mockRejectedValue(new Error('API Error'))
        }
      });

      errorHost.send({ type: 'SUBMIT_HISTORY', payload: mockDrivingHistory });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(errorHost.actor.getSnapshot().value).toBe('error-state');
      expect(errorHost.actor.getSnapshot().context.errors.riskAssessment).toBeDefined();
    });
  });

  describe('Complete Flow', () => {
    it('should complete entire insurance quote process', async () => {
      // Simulate complete user journey
      await simulateCompleteFlow(host);
      
      expect(host.actor.getSnapshot().value).toBe('success');
      
      // Verify final state
      const finalContext = host.actor.getSnapshot().context;
      expect(finalContext.quote.premiums.total).toBeGreaterThan(0);
      expect(finalContext.applicant.personal.firstName).toBe('John');
    });
  });
});

async function simulateCompleteFlow(host: any) {
  // Personal info
  host.send({ type: 'NEXT', payload: mockApplicantData });
  
  // Vehicle info  
  host.send({ type: 'NEXT', payload: mockVehicleData });
  
  // Driving history
  host.send({ type: 'SUBMIT_HISTORY', payload: mockDrivingHistory });
  
  // Wait for risk assessment
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Coverage selection
  host.send({ type: 'COVERAGE_SELECTED', payload: mockCoverageData });
  
  // Wait for quote generation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Pay
  host.send({ type: 'ACCEPT_QUOTE' });
  host.send({ type: 'PROCESS_PAYMENT', payload: mockPaymentData });
  
  // Wait for payment processing
  await new Promise(resolve => setTimeout(resolve, 100));
}

const mockApplicantData = {
  applicant: {
    personal: { firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
    contact: { email: 'john@example.com', phone: '555-1234' }
  }
};
```

## 🎯 Key Learning Objectives

### 🏢 Enterprise Patterns Demonstrated

1. **Complex State Management**: Multi-step process with conditional logic
2. **Service Integration**: External API calls with error handling
3. **Data Validation**: Client-side validation with business rules
4. **Analytics Integration**: User journey tracking throughout flow
5. **Error Recovery**: Graceful handling of failures with retry options

### 🔧 Technical Patterns Shown

1. **Async Service Invocation**: Risk calculation and quote generation
2. **Conditional State Transitions**: Different paths based on user data
3. **Context Management**: Complex nested object updates
4. **Action Composition**: Multiple actions triggered by single events
5. **State Machine Debugging**: Step-by-step flow debugging

### 📊 Business Value Practices

1. **User Experience**: Clear progress indicators and error messages
2. **Data Capture**: Comprehensive collection of insurance-relevant data
3. **Risk Modeling**: Sophisticated risk assessment integration
4. **Conversion Optimization**: Smart defaults and guided user flow
5. **Compliance**: Audit trail of user interactions and decisions

## 🚀 Next Steps

- **Explore [Multi-Framework Implementation](./multi-framework.md)** to see how this same flow works in Vue/Angular
- **Study [API Integration Patterns](./api-integration.md)** for more service examples  
- **Try [Advanced Error Handling](./error-handling.md)** for production-ready patterns
- **Review [Performance Optimization](./performance.md)** for large-scale deployments

---

**This example showcases the full power of XState Orchestrator for enterprise applications!** 🎉
