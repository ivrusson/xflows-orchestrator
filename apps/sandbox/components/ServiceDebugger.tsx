import React, { useState, useEffect } from 'react';

export function ServiceDebugger() {
  const [services, setServices] = useState<Array<{name: string, type: 'http' | 'mock', status: 'working' | 'error' | 'pending'}>>([
    { name: 'getUserData', type: 'http', status: 'working' },
    { name: 'validateInput', type: 'http', status: 'working' },
    { name: 'saveData', type: 'http', status: 'working' }
  ]);
  
  const [requests, setRequests] = useState<Array<{
    service: string,
    method: string,
    url: string,
    status: number,
    time: number,
    timestamp: number
  }>>([]);

  const [mockMode, setMockMode] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const addMockRequest = () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const services = ['getUserData', 'validateInput', 'saveData'];
    const statuses = [200, 201, 400, 404, 500];
    
    const newRequest = {
      service: services[Math.floor(Math.random() * services.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      url: `/api/${services[Math.floor(Math.random() * services.length)]}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      time: Math.random() * 1000 + 50,
      timestamp: Date.now()
    };
    
    setRequests(prev => [newRequest, ...prev.slice(0, 19)]); // Keep last 20
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addMockRequest();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColorForCode = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 400 && code < 500) return 'text-yellow-600';
    if (code >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderServiceDetails = () => {
    const service = services.find(s => s.name === selectedService);
    if (!service) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg mb-2">🔧</p>
          <p>Select a service to view details</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">📡 Service Configuration</h5>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="space-y-2 text-sm">
              <div><span className="text-blue-600">Name:</span> {service.name}</div>
              <div><span className="text-blue-600">Type:</span> {service.type}</div>
              <div><span className="text-blue-600">Status:</span> 
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              <div><span className="text-blue-600">Mode:</span> {mockMode ? 'Mock' : 'Real'}</div>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-gray-700 mb-2">📊 Service Statistics</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-600">Total Requests:</span>
              <span className="ml-2 font-medium">
                {requests.filter(r => r.service === service.name).length}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-600">Avg Response:</span>
              <span className="ml-2 font-medium">
                {(() => {
                  const serviceRequests = requests.filter(r => r.service === service.name);
                  if (serviceRequests.length === 0) return '0ms';
                  const avg = serviceRequests.reduce((sum, r) => sum + r.time, 0) / serviceRequests.length;
                  return `${avg.toFixed(0)}ms`;
                })()}
              </span>
            </div>
          </div>
        </div>

        {mockMode && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🎭 Mock Response</h5>
            <div className="bg-yellow-50 p-3 rounded border">
              <pre className="text-xs text-gray-700">{`{
    id: "${service.name}_mock_id",
    status: "success",
    data: "Mock response for ${service.name}",
    timestamp: ${Date.now()}
}`}</pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Service Debugger Toolbar */}
      <div className="border-b px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">🌐 Service Debugger</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setMockMode(!mockMode)}
              className={`px-2 py-1 text-xs rounded ${
                mockMode ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
              }`}
            >
              {mockMode ? '🎭 Mock' : '🔗 Real'}
            </button>
            <button
              onClick={() => setRequests([])}
              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              🗑️ Clear
            </button>
            <button
              onClick={addMockRequest}
              className="px-2 py-1 text-xs bg-green-200 rounded hover:bg-green-300"
            >
              ➕ New Request
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Services Overview */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📡 Registered Services</h3>
          <div className="grid grid-cols-3 gap-3">
            {services.map(service => (
              <div 
                key={service.name}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedService === service.name 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedService(service.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{service.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Type: {service.type} • Mode: {mockMode ? 'Mock' : 'Real'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderServiceDetails()}

        {/* Request Logs */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📋 Request Logs</h3>
          <div className="bg-gray-50 rounded border max-h-48 overflow-auto">
            {requests.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg mb-2">📝</p>
                <p>No requests yet</p>
                <p className="text-sm mt-1">Interact with your flow to see requests appear</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {requests.map((request, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`font-medium ${getStatusColorForCode(request.status)}`}>
                          {request.method}
                        </span>
                        <span className="text-gray-600">{request.service}</span>
                        <span className="text-gray-500 text-xs">{request.url}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{request.time.toFixed(0)}ms</span>
                        <span>{new Date(request.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📊 Service Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded border text-center">
              <div className="text-lg font-bold text-green-800">
                {requests.filter(r => r.status >= 200 && r.status < 300).length}
              </div>
              <div className="text-sm text-green-600">Success</div>
            </div>
            <div className="bg-red-50 p-3 rounded border text-center">
              <div className="text-lg font-bold text-red-800">
                {requests.filter(r => r.status >= 400).length}
              </div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
            <div className="bg-blue-50 p-3 rounded border text-center">
              <div className="text-lg font-bold text-blue-800">
                {requests.length > 0 ? (requests.reduce((sum, r) => sum + r.time, 0) / requests.length).toFixed(0) : '0'}ms
              </div>
              <div className="text-sm text-blue-600">Avg Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Debugger Status */}
      <div className="border-t px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>🌐 Services: {services.length}</span>
            <span>📋 Requests: {requests.length}</span>
            <span>🎭 Mode: {mockMode ? 'Mock' : 'Real'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
              Monitoring ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
