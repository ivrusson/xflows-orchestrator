import React from 'react';
import { StatusBar, StatusItem, StatusLabel, StatusValue } from '../ui';

interface FlowStatusBarProps {
  flowId: string;
  currentState: string;
  eventCount: number;
  renderTime: number;
  memoryUsage: string;
  updateCount: number;
}

export function FlowStatusBar({
  flowId,
  currentState,
  eventCount,
  renderTime,
  memoryUsage,
  updateCount
}: FlowStatusBarProps) {
  return (
    <StatusBar>
      <StatusItem>
        <StatusLabel>📁 Flow:</StatusLabel>
        <StatusValue>{flowId || 'untitled'}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>📍 State:</StatusLabel>
        <StatusValue>{currentState || 'Unknown'}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>🎯 Events:</StatusLabel>
        <StatusValue>{eventCount}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>⏱️ Render:</StatusLabel>
        <StatusValue>{renderTime.toFixed(2)}ms</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>💾 Memory:</StatusLabel>
        <StatusValue>{memoryUsage}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>🔄 Updates:</StatusLabel>
        <StatusValue>{updateCount}</StatusValue>
      </StatusItem>
    </StatusBar>
  );
}
