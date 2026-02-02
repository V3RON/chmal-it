import React from 'react';

export default function HooksImplementation() {
  const standardLogs = [
    "Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.",
    "Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:",
    "1. You might have mismatching versions of React and the renderer (such as React DOM)",
    "2. You might be breaking the Rules of Hooks",
    "3. You might have more than one copy of React in the same app",
    "    at useContext (react.development.js:1618)",
    "    at MyWidget (MyWidget.js:2)",
    "    at renderWithHooks (react-reconciler.development.js:150)"
  ];

  const voltraLogs = [
     "> [Voltra] Preparing to render <MyWidget />...",
     "> [Dispatcher] Swapping ReactCurrentDispatcher...",
     "> [Interceptor] useContext(ThemeContext) called.",
     "> [TreeWalker] Searching parent tree for ThemeContext.Provider...",
     "> [TreeWalker] Found Provider! Value: { color: 'red' }",
     "> [Interceptor] Returning context value.",
     "> [Voltra] Component returned: <Text color=\"red\">Hello!</Text>",
     "> [Dispatcher] Restoring original dispatcher.",
     "> Render Success!"
  ];

  const Console = ({ title, logs, isError = false }: { title: string, logs: string[], isError?: boolean }) => (
    <div className="flex flex-col h-64 bg-black rounded-lg border border-gray-700 overflow-hidden font-mono text-xs">
        <div className="bg-gray-900 px-3 py-1.5 border-b border-gray-700 text-gray-400 flex justify-between items-center">
            <span className="font-bold uppercase tracking-widest text-[10px]">{title}</span>
            <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]'}`}></div>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
                <div key={i} className={`${log.startsWith('Error') ? 'text-red-400' : log.startsWith('Warning') ? 'text-yellow-400' : log.includes('Success') ? 'text-green-400' : log.startsWith('>') ? 'text-blue-300' : 'text-gray-300'}`}>
                    {log}
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900 my-8 shadow-2xl">
       <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
         <span>Custom Renderer Hook Implementation</span>
      </div>

      {/* Top: Context Visual */}
      <div className="hidden md:flex bg-[#0d1117] p-4 md:p-6 border-b border-gray-700 justify-center items-center relative overflow-hidden">
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
             <div className="bg-gray-800 p-3 md:p-4 rounded-lg shadow-xl border border-gray-600 w-full">
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

      {/* Comparison View */}
      <div className="bg-gray-800 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Console title="React DOM (Unmounted)" logs={standardLogs} isError={true} />
          <Console title="Voltra (Custom Renderer)" logs={voltraLogs} />
      </div>
    </div>
  );
}


