import { Virtuoso } from 'react-virtuoso';
import type { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  filter: 'all' | 'success' | 'error' | 'success-get';
  onFilterChange: (filter: 'all' | 'success' | 'error' | 'success-get') => void;
  t: any;
}

const LogViewer = ({ logs, filter, onFilterChange, t }: LogViewerProps) => {
  const filteredLogs = logs.filter(l => filter === 'all' || l.type === filter);

  const counts = {
    all: logs.length,
    success: logs.filter(l => l.type === 'success').length,
    'success-get': logs.filter(l => l.type === 'success-get').length,
    error: logs.filter(l => l.type === 'error').length,
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2 text-xs">
        {(['all', 'success', 'success-get', 'error'] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              filter === f 
                ? (f === 'success' ? 'bg-green-800' : f === 'success-get' ? 'bg-purple-800' : f === 'error' ? 'bg-red-800' : 'bg-gray-600') + ' text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span>{f === 'all' ? t.filterAll : f === 'success' ? t.filterSuccess : f === 'success-get' ? t.filterGet : t.filterError}</span>
            <span className={`px-1 rounded ${filter === f ? 'bg-black/30' : 'bg-gray-900 text-gray-500'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="bg-black h-64 border border-gray-800 rounded">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-600 text-center pt-10 text-xs font-mono">{t.noLogs}</div>
        ) : (
          <Virtuoso
            data={filteredLogs}
            itemContent={(index, l) => (
              <div className={`px-2 py-1 text-xs font-mono ${l.type === 'error' ? 'text-red-400' : l.type === 'success' ? 'text-green-400' : l.type === 'success-get' ? 'text-purple-400' : 'text-gray-300'}`}>
                <span className="opacity-50">[{l.time}]</span> {l.message}
                {l.txid && (
                  <a href={`https://solscan.io/tx/${l.txid}`} target="_blank" rel="noreferrer" className="ml-2 underline text-blue-400 hover:text-blue-300">
                    {t.viewTx}
                  </a>
                )}
              </div>
            )}
            followOutput={'auto'}
          />
        )}
      </div>
    </div>
  );
};

export default LogViewer;