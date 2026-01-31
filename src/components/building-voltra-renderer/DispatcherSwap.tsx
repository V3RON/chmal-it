import React, { useState, useRef, useEffect } from 'react';

export default function DispatcherSwap() {
  const [isVoltraEnabled, setIsVoltraEnabled] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleRender = () => {
    setLogs([]); // Clear previous logs
    
    // Slight delay to simulate processing
    setTimeout(() => {
        if (!isVoltraEnabled) {
          // Simulate Standard React behavior (Crash outside component tree)
          setLogs([
            "Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.",
            "Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:",
            "1. You might have mismatching versions of React and the renderer (such as React DOM)",
            "2. You might be breaking the Rules of Hooks",
            "3. You might have more than one copy of React in the same app",
            "    at useContext (react.development.js:1618)",
            "    at MyWidget (MyWidget.js:2)",
            "    at renderWithHooks (react-reconciler.development.js:150)"
          ]);
        } else {
          // Simulate Voltra behavior (Intercepted)
          setLogs([
             "> [Voltra] Preparing to render <MyWidget />...",
             "> [Dispatcher] Swapping ReactCurrentDispatcher...",
             "> [Interceptor] useContext(ThemeContext) called.",
             "> [TreeWalker] Searching parent tree for ThemeContext.Provider...",
             "> [TreeWalker] Found Provider! Value: { color: 'red' }",
             "> [Interceptor] Returning context value.",
             "> [Voltra] Component returned: <Text color=\"red\">Hello!</Text>",
             "> [Dispatcher] Restoring original dispatcher.",
             "> Render Success!"
          ]);
        }
    }, 300);
  };

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900 my-8 shadow-2xl">
       <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
         <span>Dispatcher Playground</span>
         <div className={`w-2 h-2 rounded-full ${isVoltraEnabled ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></div>
      </div>

      {/* Top: Context Visual */}
      <div className="bg-[#0d1117] p-4 md:p-6 border-b border-gray-700 flex justify-center items-center relative overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-10" 
              style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
         </div>

         <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 text-xs text-gray-500 font-mono">Global App Context</div>
            <div className="border border-purple-500/50 bg-purple-900/20 px-6 py-3 rounded-lg backdrop-blur-sm shadow-lg">
                <code className="text-purple-300 font-mono text-sm">ThemeContext = {'{'} color: "red" {'}'}</code>
            </div>
            
            {/* Connection Line */}
            <div className="h-8 w-px bg-gray-600 my-2"></div>
            
            {/* The Component Code */}
             <div className="bg-gray-800 p-3 md:p-4 rounded-lg shadow-xl border border-gray-600 max-w-sm w-full">
                <div className="text-xs text-gray-500 mb-2 border-b border-gray-700 pb-1">MyWidget.js</div>
                <pre className="text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto">
{`function MyWidget() {
  const theme = useContext(ThemeContext);
  return <Text color={theme.color}>Hello!</Text>;
}`}
                </pre>
             </div>
         </div>
      </div>

      {/* Control Room */}
      <div className="bg-gray-800 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Controls */}
          <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                  <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200">Custom Dispatcher</span>
                      <span className="text-xs text-gray-500">Intercept React Hooks</span>
                  </div>
                  <button 
                    onClick={() => setIsVoltraEnabled(!isVoltraEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isVoltraEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isVoltraEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
              </div>

              <button
                onClick={handleRender}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isVoltraEnabled ? 'bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/20' : 'bg-red-600 hover:bg-red-500 shadow-lg hover:shadow-red-500/20'}`}
              >
                  {isVoltraEnabled ? 'Render with Voltra' : 'Render with React DOM'}
              </button>
          </div>

          {/* Console */}
          <div className="flex flex-col h-40 bg-black rounded-lg border border-gray-700 overflow-hidden font-mono text-xs">
              <div className="bg-gray-900 px-3 py-1 border-b border-gray-700 text-gray-500 flex justify-between">
                  <span>Terminal</span>
                  <span onClick={() => setLogs([])} className="cursor-pointer hover:text-white">Clear</span>
              </div>
              <div ref={consoleRef} className="flex-1 p-2 overflow-y-auto space-y-1">
                  {logs.length === 0 && <span className="text-gray-600 italic">Ready...</span>}
                  {logs.map((log, i) => (
                      <div key={i} className={`${log.startsWith('Error') ? 'text-red-400' : log.startsWith('Warning') ? 'text-yellow-400' : log.includes('Success') ? 'text-green-400' : log.startsWith('>') ? 'text-blue-300' : 'text-gray-300'}`}>
                          {log}
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
