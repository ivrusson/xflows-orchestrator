# 🧪 XFlows Integration Tests

This directory contains comprehensive integration tests for XFlows framework, ensuring that flows and plugins work correctly together.

## 📋 Test Structure

### **Integration Test Files**

| File | Purpose | Coverage |
|------|---------|----------|
| `integration.test.tsx` | React + Flow integration | FlowComponent, useFlow hook, navigation |
| `integration.test.ts` | Core + Plugin integration | FlowOrchestrator, PluginManager, HTTP plugins |
| `e2e-integration.test.ts` | End-to-end scenarios | Complete user journeys, error handling |

### **Test Categories**

#### **1. FlowOrchestrator + Plugin Integration**
- ✅ FlowConfig validation with plugins
- ✅ Plugin registration and execution
- ✅ HTTP Action/Actor plugin functionality
- ✅ Error handling and edge cases

#### **2. React Plugin Integration**
- ✅ FlowComponent rendering
- ✅ useFlow hook functionality
- ✅ Form handling and navigation
- ✅ State management and context updates

#### **3. End-to-End Scenarios**
- ✅ Complete user registration flow
- ✅ E-commerce checkout flow
- ✅ API integration with plugins
- ✅ Error recovery scenarios

## 🚀 Running Tests

### **All Integration Tests**
```bash
pnpm test:integration
```

### **Specific Test Categories**
```bash
# Core + Plugin integration
pnpm --filter @xflows/core test integration

# React integration
pnpm --filter @xflows/react-demo test integration

# End-to-end scenarios
pnpm test:e2e
```

### **Individual Test Files**
```bash
# Run specific test file
pnpm --filter @xflows/core test integration.test.ts
pnpm --filter @xflows/core test e2e-integration.test.ts
```

## 📊 Test Coverage

### **FlowOrchestrator Integration**
- [x] Valid FlowConfig creation
- [x] Plugin configuration validation
- [x] Machine state generation
- [x] Error handling for invalid configs

### **Plugin System Integration**
- [x] HTTP Action plugin execution
- [x] HTTP Actor plugin execution
- [x] Plugin registration and management
- [x] Plugin error handling

### **React Integration**
- [x] FlowComponent rendering
- [x] useFlow hook state management
- [x] Form submission and validation
- [x] Navigation between steps
- [x] Context updates and persistence

### **End-to-End Scenarios**
- [x] User registration flow
- [x] E-commerce checkout flow
- [x] API calls with plugins
- [x] Error recovery and retry logic
- [x] Complex multi-step workflows

## 🔧 Test Configuration

### **Mock Setup**
Tests use mocked HTTP requests to simulate API calls:

```typescript
// Mock successful API response
(global.fetch as any).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ success: true, data: {} }),
});

// Mock API failure
(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
```

### **Test Data**
Tests use realistic flow configurations:

```typescript
const registrationFlow = {
  id: 'user-registration',
  name: 'User Registration Flow',
  plugins: {
    httpClient: { type: 'actor', config: { baseUrl: 'https://api.example.com' } }
  },
  steps: [
    // Complete step definitions...
  ]
};
```

## 📈 Test Results

### **Expected Outcomes**
- ✅ All integration tests pass
- ✅ FlowOrchestrator creates valid XState machines
- ✅ Plugins execute correctly with mocked APIs
- ✅ React components render and handle user interactions
- ✅ Error scenarios are handled gracefully

### **Performance Benchmarks**
- Flow creation: < 100ms
- Plugin execution: < 50ms (mocked)
- Component rendering: < 200ms
- Navigation transitions: < 50ms

## 🐛 Debugging Tests

### **Common Issues**

#### **Plugin Not Found**
```bash
Error: Plugin 'httpClient' not found
```
**Solution**: Ensure plugins are registered in test setup

#### **Flow Validation Errors**
```bash
Error: Flow configuration validation failed
```
**Solution**: Check FlowConfig structure and required fields

#### **React Component Not Rendering**
```bash
Error: Component not found in DOM
```
**Solution**: Verify FlowComponent props and flow configuration

### **Debug Commands**
```bash
# Run tests with verbose output
pnpm test:integration -- --verbose

# Run specific test with debug info
pnpm test:integration -- --grep "should handle complete user journey"

# Run tests in watch mode
pnpm test:integration -- --watch
```

## 🔄 Continuous Integration

### **CI Pipeline**
Integration tests run automatically on:
- Pull request creation
- Push to main branch
- Release preparation

### **Test Requirements**
- Node.js 18+
- pnpm 9+
- All packages built (`pnpm build`)
- Dependencies installed (`pnpm install`)

## 📝 Adding New Tests

### **Test Structure**
```typescript
describe('New Feature Integration', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should handle new feature correctly', async () => {
    // Test implementation
  });
});
```

### **Best Practices**
- Use descriptive test names
- Mock external dependencies
- Test both success and error scenarios
- Include realistic test data
- Verify all expected outcomes

## 🎯 Future Enhancements

### **Planned Tests**
- [ ] Database plugin integration
- [ ] Authentication plugin testing
- [ ] Analytics plugin verification
- [ ] Performance testing with large flows
- [ ] Browser compatibility testing

### **Test Infrastructure**
- [ ] Visual regression testing
- [ ] Load testing for complex flows
- [ ] Accessibility testing
- [ ] Cross-browser testing

---

**Note**: These integration tests ensure XFlows is production-ready and all components work together seamlessly. Run them regularly during development and before releases.
