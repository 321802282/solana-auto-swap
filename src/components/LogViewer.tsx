import type { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  filter: 'all' | 'success' | 'error' | 'success-get';
  onFilterChange: (filter: 'all' | 'success' | 'error' | 'success-get') => void;
  t: any;
}

const LogViewer = ({ logs, filter, onFilterChange, t }: LogViewerProps) => {
  const filteredLogs = logs.filter(l => filter === 'all' || l.type === filter);

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2 text-xs">
        {(['all', 'success', 'success-get', 'error'] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-2 py-1 rounded transition ${filter === f
                ? (f === 'success' ? 'bg-green-800' : f === 'success-get' ? 'bg-purple-800' : f === 'error' ? 'bg-red-800' : 'bg-gray-600') + ' text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            {f === 'all' ? t.filterAll : f === 'success' ? t.filterSuccess : f === 'success-get' ? t.filterGet : t.filterError}
          </button>
        ))}
      </div>

      <div className="bg-black p-2 h-64 overflow-y-auto text-xs font-mono border border-gray-800 rounded">
        {filteredLogs.map((l) => (
          <div key={l.id} className={`mb-1 ${l.type === 'error' ? 'text-red-400' : l.type === 'success' ? 'text-green-400' : l.type === 'success-get' ? 'text-purple-400' : 'text-gray-300'}`}>
            <span className="opacity-50">[{l.time}]</span> {l.message}
            {l.txid && (
              <a href={`https://solscan.io/tx/${l.txid}`} target="_blank" rel="noreferrer" className="ml-2 underline text-blue-400 hover:text-blue-300">
                {t.viewTx}
              </a>
            )}
          </div>
        ))}
        {filteredLogs.length === 0 && <div className="text-gray-600 text-center mt-10">{t.noLogs}</div>}
      </div>
    </div>
  );
};

export default LogViewer;