import React, { useState, useEffect } from 'react';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 16,
    memoryUsage: 45,
    updateCount: 0,
    stateTransitions: 0,
    eventCount: 0,
    serviceCalls: 0
  });

  const [history, setHistory] = useState<Array<{
    timestamp: number,
    renderTime: number,
    memoryUsage: number
  }>>([]);

  const [thresholds, setThresholds] = useState({
    renderTime: 50,
    memoryUsage: 100,
    updateCount: 1000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        renderTime: Math.random() * 50 + 10,
        memoryUsage: Math.random() * 20 + 40,
        updateCount: prev.updateCount + Math.floor(Math.random() * 3),
        stateTransitions: prev.stateTransitions + Math.floor(Math.random() * 2),
        eventCount: prev.eventCount + Math.floor(Math.random() * 5),
        serviceCalls: prev.serviceCalls + Math.floor(Math.random() * 2)
      }));
    }, 1000);

    // Add to history every 5 seconds
    const historyInterval = setInterval(() => {
      setHistory(prev => [{
        timestamp: Date.now(),
        renderTime: Math.random() * 50 + 10,
        memoryUsage: Math.random() * 20 + 40
      }, ...prev.slice(0, 19)]);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, []);

  const getMetricColor = (value: number, threshold: number, reverse: boolean = false) => {
    const ratio = value / threshold;
    if (reverse ? ratio <= 0.5 : ratio >= 1.5) return 'text-red-600';
    if (reverse ? ratio <= 0.8 : ratio >= 1.2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderPerformanceChart = () => {
    const maxRenderTime = Math.max(...history.map(h => h.renderTime));
    const maxMemory = Math.max(...history.map(h => h.memoryUsage));

    return (
      <div className="space-y-4">
        {/* Render Time Chart */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">⚡ Render Time (ms)</h5>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-end h-20 space-x-1">
              {history.slice(0, 10).reverse().map((point, index) => {
                const height = (point.renderTime / maxRenderTime) * 100;
                return (
                  <div key={index} className="flex flex-col flex-1">
                    <div 
                      className={`w-full rounded-t ${
                        getMetricColor(point.renderTime, thresholds.renderTime) === 'text-red-600'
                          ? 'bg-red-400' 
                          : getMetricColor(point.renderTime, thresholds.renderTime) === 'text-yellow-600'
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(point.timestamp).toLocaleTimeString().slice(-8, -3)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>0ms</span>
              <span className="font-medium">{maxRenderTime.toFixed(0)}ms</span>
            </div>
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">💾 Memory Usage (MB)</h5>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-end h-20 space-x-1">
              {history.slice(0, 10).reverse().map((point, index) => {
                const height = (point.memoryUsage / maxMemory) * 100;
                return (
                  <div key={index} className="flex flex-col flex-1">
                    <div 
                      className={`w-full rounded-t ${
                        getMetricColor(point.memoryUsage, thresholds.memoryUsage) === 'text-red-600'
                          ? 'bg-red-400' 
                          : getMetricColor(point.memoryUsage, thresholds.memoryUsage) === 'text-yellow-600'
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(point.timestamp).toLocaleTimeString().slice(-8, -3)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>0MB</span>
              <span className="font-medium">{maxMemory.toFixed(0)}MB</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    const alerts = [];
    
    if (metrics.renderTime > thresholds.renderTime) {
      alerts.push({
        type: 'warning',
        message: `Render time ${metrics.renderTime.toFixed(1)}ms exceeds threshold ${thresholds.renderTime}ms`,
        metric: 'renderTime'
      });
    }
    
    if (metrics.memoryUsage > thresholds.memoryUsage) {
      alerts.push({
        type: 'error',
        message: `Memory usage ${metrics.memoryUsage.toFixed(1)}MB exceeds threshold ${thresholds.memoryUsage}MB`,
        metric: 'memoryUsage'
      });
    }
    
    if (metrics.updateCount > thresholds.updateCount && metrics.updateCount % 100 === 0) {
      alerts.push({
        type: 'info',
        message: `High update count: ${metrics.updateCount}`,
        metric: 'updateCount'
      });
    }

    if (alerts.length === 0) {
      return (
        <div className="bg-green-50 border border-green-200 p-3 rounded text-green-800 text-sm">
          ✅ All metrics within normal thresholds
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div key={index} className={`border p-3 rounded text-sm ${
            alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span>
                {alert.type === 'error' ? '🛑' :
                 alert.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span>{alert.message}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Performance Monitor Toolbar */}
      <div className="border-b px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">📊 Performance Monitor</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setHistory([])}
              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              🗑️ Clear Data
            </button>
            <button
              onClick={() => setMetrics(prev => ({
                ...prev,
                renderTime: 16,
                memoryUsage: 45,
                updateCount: 0,
                stateTransitions: 0,
                eventCount: 0,
                serviceCalls: 0
              }))}
              className="px-2 py-1 text-xs bg-blue-200 rounded hover:bg-blue-300"
            >
              🔄 Reset Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Current Metrics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📈 Current Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 border rounded">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Render Time</span>
                <span className={`font-bold ${getMetricColor(metrics.renderTime, thresholds.renderTime)}`}>
                  {metrics.renderTime.toFixed(1)}ms
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Threshold: {thresholds.renderTime}ms
              </div>
            </div>

            <div className="bg-white p-3 border rounded">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Memory</span>
                <span className={`font-bold ${getMetricColor(metrics.memoryUsage, thresholds.memoryUsage)}`}>
                  {metrics.memoryUsage.toFixed(1)}MB
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Threshold: {thresholds.memoryUsage}MB
              </div>
            </div>

            <div className="bg-white p-3 border rounded">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Updates</span>
                <span className="font-bold text-blue-600">
                  {metrics.updateCount}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Threshold: {thresholds.updateCount}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">🔄 Activity Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded border text-center">
              <div className="text-lg font-bold text-blue-800">{metrics.stateTransitions}</div>
              <div className="text-sm text-blue-600">State Transitions</div>
            </div>
            <div className="bg-purple-50 p-3 rounded border text-center">
              <div className="text-lg font-bold text-purple-800">{metrics.eventCount}</div>
              <div className="text-sm text-purple-600">Events Processed</div>
            </div>
            <div className="bg-green-50 p-3 rounded border text-center">
              <div className="text-lg font-bold text-green-800">{metrics.serviceCalls}</div>
              <div className="text-sm text-green-600">Service Calls</div>
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📊 Performance Trends</h3>
          {renderPerformanceChart()}
        </div>

        {/* Alerts */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">🚨 Alerts & Thresholds</h3>
          {renderAlerts()}
        </div>

        {/* Threshold Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">⚙️ Threshold Settings</h3>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Render Time Threshold (ms)
                </label>
                <input
                  type="number"
                  value={thresholds.renderTime}
                  onChange={(e) => setThresholds(prev => ({ ...prev, renderTime: Number(e.target.value) }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Usage Threshold (MB)
                </label>
                <input
                  type="number"
                  value={thresholds.memoryUsage}
                  onChange={(e) => setThresholds(prev => ({ ...prev, memoryUsage: Number(e.target.value) }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Count Threshold
                </label>
                <input
                  type="number"
                  value={thresholds.updateCount}
                  onChange={(e) => setThresholds(prev => ({ ...prev, updateCount: Number(e.target.value) }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Monitor Status */}
      <div className="border-t px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>⚡ Render: {metrics.renderTime.toFixed(1)}ms</span>
            <span>💾 Memory: {metrics.memoryUsage.toFixed(1)}MB</span>
            <span>🔄 Updates: {metrics.updateCount}</span>
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
