import React, { useState, useEffect } from 'react';

interface EventTesterProps {
  flow: any;
}

export function EventTester({ flow }: EventTesterProps) {
  const [events, setEvents] = useState<Array<{id: string, name: string, payload?: any}>>([]);
  const [eventHistory, setEventHistory] = useState<Array<{event: string, payload?: any, timestamp: number, result: string}>>([]);
  const [customEvent, setCustomEvent] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Extract available events from flow states
    const availableEvents = new Set<string>();
    
    if (flow?.states) {
      Object.values(flow.states).forEach((state: any) => {
        if (state.on) {
          Object.keys(state.on).forEach(eventName => {
            availableEvents.add(eventName);
          });
        }
      });
    }

    const eventList = Array.from(availableEvents).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      payload: undefined
    }));

    setEvents(eventList);
    
    // Set first event as selected
    if (eventList.length > 0 && !selectedEvent) {
      setSelectedEvent(eventList[0].name);
    }
  }, [flow]);

  const sendEvent = (eventName: string, payload?: any) => {
    const timestamp = Date.now();
    const result = Math.random() > 0.1 ? 'success' : 'error'; // Mock result
    
    const newHistory = {
      event: eventName,
      payload,
      timestamp,
      result
    };
    
    setEventHistory(prev => [newHistory, ...prev.slice(0, 9)]); // Keep last 10
    
    // Dispatch to parent
    console.log('Sending event:', { event: eventName, payload });
  };

  const handleCustomEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEvent.trim()) {
      let payload;
      try {
        payload = customPayload.trim() ? JSON.parse(customPayload) : undefined;
      } catch (e) {
        alert('Invalid JSON payload');
        return;
      }
      
      sendEvent(customEvent.trim(), payload);
      setCustomEvent('');
      setCustomPayload('');
    }
  };

  const generateRandomPayload = (eventName: string) => {
    const generators = {
      'NEXT': () => ({ step: Math.floor(Math.random() * 10) + 1 }),
      'BACK': () => ({ reason: 'user_cancelled' }),
      'ERROR': () => ({ error: 'Mock error', code: 'ERR_MOCK' }),
      'CLICK': () => ({ buttonId: 'btn-' + Math.random().toString(36).substr(2, 9) }),
      'VALIDATE': () => ({ data: { age: 25, name: 'John' }, rule: 'age_check' }),
      'SUBMIT': () => ({ formData: { email: 'test@example.com', agreeToTerms: true } }),
      'RETRY': () => ({ attempts: Math.floor(Math.random() * 3) + 1 })
    };
    
    const generator = generators[eventName];
    return generator ? generator() : { timestamp: Date.now() };
  };

  const renderEventPreview = (eventName: string) => {
    const payload = generateRandomPayload(eventName);
    
    return (
      <div className="mt-2 text-xs bg-gray-50 p-2 rounded border">
        <div className="font-medium text-gray-600 mb-1">Example Payload:</div>
        <pre className="text-gray-700">{JSON.stringify(payload, null, 2)}</pre>
      </div>
    );
  };

  const renderEventHistory = () => {
    if (eventHistory.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg mb-2">📜</p>
          <p>No events sent yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {eventHistory.map((entry, index) => (
          <div 
            key={index}
            className={`p-2 rounded border text-sm ${
              entry.result === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  entry.result === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {entry.result === 'success' ? '✓' : '✗'}
                </span>
                <span className="font-medium text-gray-700">{entry.event}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {entry.payload && (
              <div className="mt-1 text-xs">
                <pre className="text-gray-600 bg-white p-1 rounded max-h-20 overflow-auto">
                  {JSON.stringify(entry.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Event Tester Toolbar */}
      <div className="border-b px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">⚡ Event Tester</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2 py-1 text-xs rounded ${
                isPlaying ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
              }`}
            >
              {isPlaying ? '⏸️ Stop' : '▶️ Auto'}
            </button>
            <button
              onClick={() => setEventHistory([])}
              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Available Events */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">🎯 Available Events</h3>
          <div className="grid grid-cols-2 gap-2">
            {events.map(event => (
              <div key={event.id} className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedEvent === event.name 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedEvent(event.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{event.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const payload = generateRandomPayload(event.name);
                      sendEvent(event.name, payload);
                    }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
                {renderEventPreview(event.name)}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Event */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">🎯 Custom Events</h3>
          <form onSubmit={handleCustomEventSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Event Name
              </label>
              <input
                type="text"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="e.g., CUSTOM_ACTION"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Payload (JSON)
              </label>
              <textarea
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🚀 Send Custom Event
            </button>
          </form>
        </div>

        {/* Event History */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📜 Event History</h3>
          <div className="bg-gray-50 rounded p-3 max-h-48 overflow-auto">
            {renderEventHistory()}
          </div>
        </div>
      </div>

      {/* Event Tester Status */}
      <div className="border-t px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>⚡ Events: {events.length}</span>
            <span>📜 History: {eventHistory.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
              Ready ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
