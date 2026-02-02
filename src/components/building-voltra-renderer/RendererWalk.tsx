import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
type NodeType = 'component' | 'host' | 'primitive' | 'array';
type ActionType = 'enter' | 'expand' | 'emit' | 'leave';

interface Node {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  parentId?: string;
  childrenIds: string[];
}

interface Step {
  nodeId: string;
  action: ActionType;
  description: string;
  outputSnippet?: string;
}

// --- Data ---
const NODES: Record<string, Node> = {
  'root': { id: 'root', label: '<App />', type: 'component', x: 250, y: 30, childrenIds: ['header', 'view'] },
  'header': { id: 'header', label: '<Header />', type: 'component', x: 100, y: 110, parentId: 'root', childrenIds: [] },

  // View contains an array of items
  'view': { id: 'view', label: '<View>', type: 'host', x: 400, y: 110, parentId: 'root', childrenIds: ['list'] },

  // The array node
  'list': { id: 'list', label: '[Array]', type: 'array', x: 400, y: 180, parentId: 'view', childrenIds: ['item1', 'item2'] },

  'item1': { id: 'item1', label: '<Text>A</Text>', type: 'host', x: 330, y: 260, parentId: 'list', childrenIds: [] },
  'item2': { id: 'item2', label: '<Text>B</Text>', type: 'host', x: 470, y: 260, parentId: 'list', childrenIds: [] },
};

const STEPS: Step[] = [
  { nodeId: 'root', action: 'enter', description: 'React calls App()' },
  { nodeId: 'root', action: 'expand', description: 'App returns children' },

  // Header Branch
  { nodeId: 'header', action: 'enter', description: 'React calls Header()' },
  { nodeId: 'header', action: 'expand', description: 'Header returns null' },
  { nodeId: 'header', action: 'leave', description: 'Finished Header' },

  // View Branch
  { nodeId: 'view', action: 'enter', description: 'Encountered Host Component <View>' },
  { nodeId: 'view', action: 'emit', description: 'Pushing View to output', outputSnippet: '{\n  type: "View",\n  children: [' },

  // Array
  { nodeId: 'list', action: 'enter', description: 'Encountered Array in children' },
  { nodeId: 'list', action: 'expand', description: 'Iterating over array items...' },

  // Item 1
  { nodeId: 'item1', action: 'enter', description: 'Processing Item 1' },
  { nodeId: 'item1', action: 'emit', description: 'Pushing Text A', outputSnippet: '\n    { type: "Text", children: ["A"] },' },
  { nodeId: 'item1', action: 'leave', description: 'Finished Item 1' },

  // Item 2
  { nodeId: 'item2', action: 'enter', description: 'Processing Item 2' },
  { nodeId: 'item2', action: 'emit', description: 'Pushing Text B', outputSnippet: '\n    { type: "Text", children: ["B"] }' },
  { nodeId: 'item2', action: 'leave', description: 'Finished Item 2' },

  // Close Array
  { nodeId: 'list', action: 'leave', description: 'Finished Array' },

  // Close View
  { nodeId: 'view', action: 'leave', description: 'Finished View', outputSnippet: '\n  ]\n}' },

  { nodeId: 'root', action: 'leave', description: 'Render Complete' },
];

export default function RendererWalk() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<number | null>(null);

  const currentStep = STEPS[currentStepIndex];
  const currentNode = NODES[currentStep.nodeId];

  // Calculate output up to current step
  const currentOutput = STEPS.slice(0, currentStepIndex + 1)
    .filter(s => s.outputSnippet)
    .map(s => s.outputSnippet)
    .join('');

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStepIndex(Number(e.target.value));
    setIsPlaying(false);
  };

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'component': return 'fill-blue-900/50 stroke-blue-500';
      case 'host': return 'fill-green-900/50 stroke-green-500';
      case 'primitive': return 'fill-gray-700 stroke-gray-500';
      case 'array': return 'fill-purple-900/50 stroke-purple-500';
    }
  };

  return (
    <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900 my-8 shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
        <span>Renderer Walk Visualization</span>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded text-[10px] ${isPlaying ? 'bg-green-900 text-green-300' : 'bg-gray-700'}`}>
            {isPlaying ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Main Area: Tree + Sidebar */}
      <div className="flex flex-col md:flex-row h-auto md:h-[400px]">

        {/* Tree Visualization */}
        <div className="relative bg-[#0d1117] overflow-hidden h-[300px] md:h-auto md:flex-1">
          <svg className="w-full h-full" viewBox="0 0 500 350">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="3.5" orient="auto">
                <polygon points="0 0, 6 3.5, 0 7" fill="#4b5563" />
              </marker>
            </defs>

            {/* Connections */}
            {Object.values(NODES).map(node => node.childrenIds.map(childId => {
              const child = NODES[childId];
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x} y1={node.y}
                  x2={child.x} y2={child.y}
                  stroke="#374151"
                  strokeWidth="2"
                />
              );
            }))}

            {/* Nodes */}
            {Object.values(NODES).map(node => (
              <g key={node.id} className="transition-all duration-300">
                <circle
                  cx={node.x} cy={node.y} r="25"
                  className={`${getNodeColor(node.type)} transition-all duration-300 ${node.id === currentStep.nodeId ? 'stroke-[3px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'stroke-1'}`}
                />
                <text
                  x={node.x} y={node.y} dy="4"
                  textAnchor="middle"
                  className="text-[10px] fill-gray-200 pointer-events-none font-mono"
                >
                  {node.label.length > 8 ? node.label.slice(0, 6) + '..' : node.label}
                </text>
                {/* Label below */}
                <text
                  x={node.x} y={node.y + 40}
                  textAnchor="middle"
                  className={`text-[9px] fill-gray-500 uppercase tracking-widest ${node.id === currentStep.nodeId ? 'fill-white font-bold' : ''}`}
                >
                  {node.type}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute top-4 left-4 space-y-2 pointer-events-none opacity-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-900 border border-blue-500"></div>
              <span className="text-[10px] text-gray-400">React Component</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-900 border border-green-500"></div>
              <span className="text-[10px] text-gray-400">Host Component</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-900 border border-purple-500"></div>
              <span className="text-[10px] text-gray-400">Array</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Status & Output */}
        <div className="w-full md:w-64 bg-gray-900 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col h-[350px] md:h-auto">
          <div className="p-4 border-b border-gray-800">
            <div className="text-xs text-gray-500 uppercase mb-1">Current Action</div>
            <div className="text-sm font-bold text-white mb-2">{currentStep.description}</div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500">Node:</span>
              <code className="bg-gray-800 px-1 rounded text-blue-300">{currentNode.label}</code>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto flex flex-col">
            <div className="text-xs text-gray-500 uppercase mb-2">Output Preview</div>
            <div className="flex-1 flex flex-col -mt-8 -mb-8">
              <pre className="flex-1 bg-black/50 p-2 rounded text-[10px] text-green-400 font-mono overflow-auto transition-all">
                {currentOutput}
                <span className="animate-pulse inline-block w-1.5 h-3 bg-green-400 ml-0.5 align-middle"></span>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-3 flex items-center space-x-4 border-t border-gray-700">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {isPlaying ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
          )}
        </button>

        <button
          onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }}
          className="text-gray-400 hover:text-white"
          title="Reset"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>

        <div className="flex-1 flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max={STEPS.length - 1}
            value={currentStepIndex}
            onChange={handleSeek}
            className="w-full accent-blue-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2 min-w-[80px]">
          <span className="text-[10px] text-gray-400">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-gray-700 text-xs text-white rounded px-1 py-0.5 border-none outline-none"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
