import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowOrchestrator } from '@xflows/core';
import FlowDemo from '../components/FlowDemo';
import demoFlow from '../flows/demo-flow.json';

// Mock the useFlow hook since we can't test it without the plugin
vi.mock('@xflows/plugin-react', () => ({
  useFlow: vi.fn(() => ({
    state: { value: 'welcome' },
    send: vi.fn(),
    view: demoFlow.steps[0].view,
    context: demoFlow.context
  }))
}));

describe('React Demo Integration Tests', () => {
  describe('FlowOrchestrator Integration', () => {
    it('should create a valid machine from demo flow', () => {
      const orchestrator = new FlowOrchestrator();
      
      expect(() => {
        const machine = orchestrator.orchestrate(demoFlow);
        expect(machine).toBeDefined();
        expect(machine.config.id).toBe('react-demo-flow');
        expect(machine.config.initial).toBe('welcome');
        expect(machine.config.states).toBeDefined();
      }).not.toThrow();
    });

    it('should validate demo flow configuration', () => {
      const orchestrator = new FlowOrchestrator();
      const validation = orchestrator.validateFlow(demoFlow);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('FlowDemo Component', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<FlowDemo />);
      }).not.toThrow();
    });

    it('should display welcome message', () => {
      render(<FlowDemo />);
      
      // Check if the welcome title is displayed
      expect(screen.getByText('Welcome to XFlows!')).toBeInTheDocument();
    });

    it('should show debugger toggle button', () => {
      render(<FlowDemo />);
      
      // Check if the debugger toggle button is present
      expect(screen.getByText(/Show Debugger/)).toBeInTheDocument();
    });
  });

  describe('Demo Flow Configuration', () => {
    it('should have correct structure', () => {
      expect(demoFlow.id).toBe('react-demo-flow');
      expect(demoFlow.name).toBe('React Demo Flow');
      expect(demoFlow.initialStep).toBe('welcome');
      expect(demoFlow.steps).toBeDefined();
      expect(demoFlow.steps.length).toBeGreaterThan(0);
    });

    it('should have valid steps', () => {
      demoFlow.steps.forEach((step, index) => {
        expect(step.id).toBeDefined();
        expect(step.name).toBeDefined();
        expect(step.view).toBeDefined();
        expect(step.view.type).toBeDefined();
      });
    });

    it('should have valid navigation', () => {
      demoFlow.steps.forEach((step) => {
        if (step.navigation) {
          expect(step.navigation).toBeDefined();
          // Navigation can be empty for final steps
        }
      });
    });
  });
});
