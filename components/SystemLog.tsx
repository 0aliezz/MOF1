import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertCircle, CheckCircle, Activity } from 'lucide-react';

interface SystemLogProps {
  logs: LogEntry[];
}

const SystemLog: React.FC<SystemLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 text-slate-200 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col h-full max-h-[400px]">
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
        <Terminal size={16} className="text-emerald-400" />
        <h3 className="font-mono text-sm font-semibold tracking-wide">系统日志</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs sm:text-sm">
        {logs.length === 0 && (
          <div className="text-slate-500 italic text-center mt-10">等待系统初始化...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-fade-in">
            <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
            <div className="flex items-start gap-2">
              {log.type === 'ACTION' && <Activity size={14} className="mt-0.5 text-blue-400 shrink-0" />}
              {log.type === 'ALERT' && <AlertCircle size={14} className="mt-0.5 text-red-400 shrink-0" />}
              {log.type === 'INFO' && <CheckCircle size={14} className="mt-0.5 text-emerald-400 shrink-0" />}
              <span className={`
                ${log.type === 'ALERT' ? 'text-red-300 font-bold' : ''}
                ${log.type === 'ACTION' ? 'text-blue-300' : 'text-slate-300'}
              `}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLog;