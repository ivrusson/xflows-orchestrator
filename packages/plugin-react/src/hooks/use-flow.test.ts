/**
 * useFlow Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlow } from '../src/hooks/use-flow';
import { FlowTranslator } from '@xflows/core';
import type { FlowConfig } from '@xflows/core';

// Mock @xstate/react
const mockUseActor = vi.fn();
vi.mock('@xstate/react', () => ({
  useActor: mockUseActor
}));

// Mock FlowTranslator
vi.mock('@xflows/core', () => ({
  FlowTranslator: vi.fn().mockImplementation(() => ({
    translate: vi.fn().mockReturnValue({
      id: 'test-machine',
      initial: 'step1',
      context: { test: 'value' },
      states: {
        step1: {
          meta: {
            view: {
              type: 'form',
              title: 'Test Form',
              fields: [],
              actions: []
            }
          }
        }
      }
    })
  }))
}));

describe('useFlow', () => {
  const mockFlowConfig: FlowConfig = {
    id: 'test-flow',
    name: 'Test Flow',
    initialStep: 'step1',
    context: { test: 'value' },
    steps: [
      {
        id: 'step1',
        name: 'Step 1',
        view: {
          type: 'form',
          title: 'Test Form',
          fields: [],
          actions: []
        },
        navigation: {
          onNext: 'step2'
        }
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return flow state and send function', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.view).toBeDefined();
      expect(result.current.context).toEqual({ test: 'value' });
      expect(typeof result.current.send).toBe('function');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should create machine with correct configuration', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      renderHook(() => useFlow(mockFlowConfig));

      expect(FlowTranslator).toHaveBeenCalled();
    });

    it('should handle loading state', () => {
      const mockState = {
        value: 'step1',
        context: { 
          test: 'value',
          ui: { isLoading: true }
        },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle error state', () => {
      const mockError = new Error('Test error');
      const mockState = {
        value: 'step1',
        context: { 
          test: 'value',
          errors: [mockError]
        },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.error).toBe(mockError);
    });

    it('should handle no view configuration', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(false)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.view).toBeUndefined();
    });
  });

  describe('send function', () => {
    it('should call send with correct event format', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      act(() => {
        result.current.send('NEXT', { test: 'data' });
      });

      expect(mockSend).toHaveBeenCalledWith({
        type: 'NEXT',
        data: { test: 'data' }
      });
    });

    it('should call send without data', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      act(() => {
        result.current.send('NEXT');
      });

      expect(mockSend).toHaveBeenCalledWith({
        type: 'NEXT',
        data: undefined
      });
    });

    it('should handle different event types', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      const events = ['NEXT', 'BACK', 'ERROR', 'CANCEL', 'CUSTOM_EVENT'];

      events.forEach(event => {
        act(() => {
          result.current.send(event, { test: 'data' });
        });

        expect(mockSend).toHaveBeenCalledWith({
          type: event,
          data: { test: 'data' }
        });
      });
    });
  });

  describe('view configuration', () => {
    it('should return correct view configuration', () => {
      const mockView = {
        type: 'form',
        title: 'Test Form',
        fields: [
          { name: 'name', type: 'text', label: 'Name', required: true }
        ],
        actions: [
          { type: 'submit', label: 'Submit', event: 'NEXT' }
        ]
      };

      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue({
          meta: { view: mockView }
        })
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.view).toEqual(mockView);
    });

    it('should handle different view types', () => {
      const viewTypes = ['form', 'display', 'decision', 'loading', 'error', 'success'];

      viewTypes.forEach(viewType => {
        const mockView = {
          type: viewType,
          title: `Test ${viewType}`,
          template: 'Test message'
        };

        const mockState = {
          value: 'step1',
          context: { test: 'value' },
          matches: vi.fn().mockReturnValue({
            meta: { view: mockView }
          })
        };
        const mockSend = vi.fn();

        mockUseActor.mockReturnValue([mockState, mockSend]);

        const { result } = renderHook(() => useFlow(mockFlowConfig));

        expect(result.current.view).toEqual(mockView);
      });
    });
  });

  describe('context handling', () => {
    it('should return correct context', () => {
      const mockContext = {
        session: { userId: '123', token: 'abc123' },
        stepData: { name: 'John' },
        errors: [],
        ui: { isLoading: false }
      };

      const mockState = {
        value: 'step1',
        context: mockContext,
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.context).toEqual(mockContext);
    });

    it('should handle context updates', () => {
      const initialContext = { test: 'initial' };
      const updatedContext = { test: 'updated' };

      const mockState = {
        value: 'step1',
        context: initialContext,
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result, rerender } = renderHook(() => useFlow(mockFlowConfig));

      expect(result.current.context).toEqual(initialContext);

      // Simulate context update
      mockUseActor.mockReturnValue([{
        ...mockState,
        context: updatedContext
      }, mockSend]);

      rerender();

      expect(result.current.context).toEqual(updatedContext);
    });
  });

  describe('error scenarios', () => {
    it('should handle machine creation errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock FlowTranslator to throw error
      (FlowTranslator as any).mockImplementation(() => {
        throw new Error('Machine creation failed');
      });

      expect(() => {
        renderHook(() => useFlow(mockFlowConfig));
      }).toThrow('Machine creation failed');

      consoleSpy.mockRestore();
    });

    it('should handle send errors gracefully', () => {
      const mockState = {
        value: 'step1',
        context: { test: 'value' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn().mockImplementation(() => {
        throw new Error('Send failed');
      });

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      expect(() => {
        act(() => {
          result.current.send('NEXT');
        });
      }).toThrow('Send failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete flow lifecycle', () => {
      const mockState = {
        value: 'step1',
        context: { 
          session: { userId: '123' },
          stepData: {},
          errors: [],
          ui: { isLoading: false }
        },
        matches: vi.fn().mockReturnValue({
          meta: {
            view: {
              type: 'form',
              title: 'Personal Information',
              fields: [
                { name: 'name', type: 'text', label: 'Name', required: true }
              ],
              actions: [
                { type: 'submit', label: 'Continue', event: 'NEXT' }
              ]
            }
          }
        })
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result } = renderHook(() => useFlow(mockFlowConfig));

      // Initial state
      expect(result.current.view).toBeDefined();
      expect(result.current.context.session.userId).toBe('123');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Send event
      act(() => {
        result.current.send('NEXT', { name: 'John Doe' });
      });

      expect(mockSend).toHaveBeenCalledWith({
        type: 'NEXT',
        data: { name: 'John Doe' }
      });
    });

    it('should handle flow configuration changes', () => {
      const initialConfig = mockFlowConfig;
      const updatedConfig = {
        ...mockFlowConfig,
        context: { test: 'updated' }
      };

      const mockState = {
        value: 'step1',
        context: { test: 'updated' },
        matches: vi.fn().mockReturnValue(true)
      };
      const mockSend = vi.fn();

      mockUseActor.mockReturnValue([mockState, mockSend]);

      const { result, rerender } = renderHook(
        ({ config }) => useFlow(config),
        { initialProps: { config: initialConfig } }
      );

      expect(result.current.context).toEqual({ test: 'updated' });

      // Update configuration
      rerender({ config: updatedConfig });

      expect(FlowTranslator).toHaveBeenCalledTimes(2);
    });
  });
});
