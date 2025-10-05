
import { Select, Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator } from 'components/ui';

interface MainToolbarProps {
  selectedPanel: string;
  onPanelChange: (panel: string) => void;
  selectedExample: string;
  onExampleChange: (example: string) => void;
  panelLayout: string;
  onLayoutChange: (layout: string) => void;
  flowError: string | null;
  onSave: () => void;
  onExport: () => void;
  examples: Array<{ value: string; label: string; group?: string }>;
}

export function MainToolbar({
  selectedPanel,
  onPanelChange,
  selectedExample,
  onExampleChange,
  panelLayout,
  onLayoutChange,
  flowError,
  onSave,
  onExport,
  examples
}: MainToolbarProps) {
  const mainTools = [
    { id: 'editor', label: 'Editor', icon: '📝' },
    { id: 'renderer', label: 'Renderer', icon: '🎨' }
  ];

  const debugTools = [
    { id: 'inspector', label: 'Inspector', icon: '🔍' },
    { id: 'events', label: 'Events', icon: '⚡' },
    { id: 'services', label: 'Services', icon: '🌐' },
    { id: 'performance', label: 'Perf', icon: '📊' }
  ];

  const layoutOptions = [
    { id: 'full', label: 'Full', icon: '⬜' },
    { id: 'split-2', label: 'Split 2', icon: '⇄' },
    { id: 'split-3', label: 'Split 3', icon: '⧉' }
  ];

  return (
    <Toolbar>
      <div className="flex items-center justify-between">
        <ToolbarGroup>
          {/* Main Tools */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {mainTools.map((tool) => (
              <ToolbarButton
                key={tool.id}
                active={selectedPanel === tool.id}
                onClick={() => onPanelChange(tool.id)}
                variant="primary"
              >
                {tool.icon} {tool.label}
              </ToolbarButton>
            ))}
            
            <ToolbarSeparator />
            
            {debugTools.map((tool) => (
              <ToolbarButton
                key={tool.id}
                active={selectedPanel === tool.id}
                onClick={() => onPanelChange(tool.id)}
                variant="debug"
              >
                {tool.icon} {tool.label}
              </ToolbarButton>
            ))}
          </div>
          
          {/* Error Display */}
          {flowError && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">
              <span>⚠️</span>
              <span>{flowError}</span>
            </div>
          )}
        </ToolbarGroup>

        <ToolbarGroup>
          {/* Example Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Examples:</label>
            <Select
              value={selectedExample}
              onChange={onExampleChange}
              options={examples}
              placeholder="Choose example..."
              className="min-w-[200px]"
            />
          </div>

          {/* Layout Controls */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {layoutOptions.map((layout) => (
              <ToolbarButton
                key={layout.id}
                active={panelLayout === layout.id}
                onClick={() => onLayoutChange(layout.id)}
                variant="secondary"
                className="px-2 py-1 text-xs"
              >
                {layout.icon}
              </ToolbarButton>
            ))}
          </div>

          {/* Action Buttons */}
          <ToolbarButton
            onClick={onSave}
            variant="primary"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            💾 Save Flow
          </ToolbarButton>
          <ToolbarButton
            onClick={onExport}
            variant="primary"
            className="bg-green-600 text-white hover:bg-green-700"
          >
            🚀 Export
          </ToolbarButton>
        </ToolbarGroup>
      </div>
    </Toolbar>
  );
}
