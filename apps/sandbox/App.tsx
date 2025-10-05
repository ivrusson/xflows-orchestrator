import { FlowSandbox } from './components/FlowSandbox';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">🚀 XFlows Sandbox</h1>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Live Development Environment
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Hot Reload</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sandbox Container */}
      <main className="h-screen">
        <FlowSandbox />
      </main>
    </div>
  );
}

export default App;