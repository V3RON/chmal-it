import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const INITIAL_CODE = `<View style={{ padding: 20 }}>
  <Header title="Welcome" />
  <Text color="blue">
    Hello, Voltra!
  </Text>
</View>`;

// Recursive JSON highlighter component
const JsonHighlighter = ({ data, level = 0 }: { data: any, level?: number }) => {
  const indent = '  '.repeat(level);

  if (data === null) return <span className="text-orange-400">null</span>;
  if (data === undefined) return <span className="text-gray-500">undefined</span>;
  if (typeof data === 'boolean') return <span className="text-orange-400">{data.toString()}</span>;
  if (typeof data === 'number') return <span className="text-blue-300">{data}</span>;
  if (typeof data === 'string') return <span className="text-green-300">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-500">[]</span>;
    return (
      <span>
        <span className="text-yellow-500">[</span>
        {data.map((item, i) => (
          <div key={i}>
            {'  '.repeat(level + 1)}
            <JsonHighlighter data={item} level={level + 1} />
            {i < data.length - 1 && <span className="text-gray-500">,</span>}
          </div>
        ))}
        {indent}<span className="text-yellow-500">]</span>
      </span>
    );
  }

  if (typeof data === 'object') {
    // Filter internal React properties
    const entries = Object.entries(data).filter(([k]) => !['_owner', '$$typeof', '_store', 'ref', 'key'].includes(k));

    // Sort so 'type' is first, then props, then others
    entries.sort((a, b) => {
      const order = ['type', 'props', 'children'];
      const idxA = order.indexOf(a[0]);
      const idxB = order.indexOf(b[0]);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    if (entries.length === 0) return <span className="text-gray-500">{'{}'}</span>;

    return (
      <span>
        <span className="text-yellow-500">{'{'}</span>
        {entries.map(([key, value], i) => (
          <div key={key}>
            {'  '.repeat(level + 1)}
            <span className="text-blue-200">"{key}"</span>
            <span className="text-gray-400">: </span>
            <JsonHighlighter data={value} level={level + 1} />
            {i < entries.length - 1 && <span className="text-gray-500">,</span>}
          </div>
        ))}
        {indent}<span className="text-yellow-500">{'}'}</span>
      </span>
    );
  }

  return <span>{String(data)}</span>;
};

export default function JsxVsReality() {
  const [input, setInput] = useState(INITIAL_CODE);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const safeHtml = html;
      // Transform JSX {{ ... }} syntax to htm compatible ${ ... }
      const transformedInput = input.replace(/=\s*\{/g, '=${');

      const runner = new Function('html', `return html\`${transformedInput}\`;`);
      const result = runner(safeHtml);

      setOutput(result);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error");
      }
    }
  }, [input]);

  return (
    <div className="flex flex-col md:flex-row h-auto min-h-[500px] md:h-96 border border-gray-700 rounded-lg overflow-hidden bg-gray-900 my-8 shadow-2xl">
      {/* Left Column: Input */}
      <div className="flex-1 flex flex-col min-h-0 h-80 max-h-80 md:h-auto md:max-h-none border-b md:border-b-0 md:border-r border-gray-700">
        <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
          <span>JSX Input</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 w-full bg-[#0d1117] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Right Column: Output */}
      <div className="flex-1 flex flex-col min-h-0 h-80 max-h-80 md:h-auto md:max-h-none bg-[#0d1117] relative">
        <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Transpiled Object (What React sees)
        </div>
        <div className={`flex-1 p-4 overflow-auto font-mono text-xs sm:text-sm whitespace-pre ${error ? 'opacity-50 blur-[1px]' : ''} transition-all`}>
          {output ? <JsonHighlighter data={output} /> : <div className="text-gray-500 italic p-4">Start typing...</div>}
        </div>
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-900/90 text-red-100 p-3 text-xs font-mono border-t border-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
