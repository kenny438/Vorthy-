



import React, { useRef, useEffect } from 'react';
import type { TerminalMessage } from '../types';

interface TerminalOutputProps {
  messages: TerminalMessage[];
  onClear: () => void;
  isVisible: boolean;
}

const getLevelColor = (level: TerminalMessage['level']): string => {
  switch (level) {
    case 'error': return 'text-error';
    case 'warn': return 'text-yellow-400';
    case 'info': return 'text-sky-400';
    case 'debug': return 'text-purple-400';
    case 'system': return 'text-teal-400';
    case 'log':
    default: return 'text-code-text'; 
  }
};

const formatPayload = (payload: any[]): React.ReactNode => {
  return payload.map((arg, index) => {
    let displayArg: any;
    if (arg === null) {
      displayArg = 'null';
    } else if (arg === undefined) {
      displayArg = 'undefined';
    } else if (typeof arg === 'string') {
      displayArg = arg;
    } else if (typeof arg === 'number' || typeof arg === 'boolean') {
      displayArg = String(arg);
    } else if (arg && arg.__error__ === true) { 
      displayArg = `${arg.name || 'Error'}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
    } else {
      try {
        if (typeof arg === 'object' && arg !== null && Object.keys(arg).length <= 5 && JSON.stringify(arg).length < 100) {
            displayArg = JSON.stringify(arg);
        } else if (typeof arg === 'object' && arg !== null) {
            displayArg = `[${arg.constructor.name || 'Object'}]`;
        }
         else {
            displayArg = String(arg); 
        }
      } catch (e) {
        displayArg = '[Unserializable Object]';
      }
    }
    return <span key={index} className="mr-2 whitespace-pre-wrap">{displayArg}</span>;
  });
};

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ messages, onClear, isVisible }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isVisible) return null;

  return (
    <div className="h-48 md:h-64 flex flex-col bg-code-bg border-t border-code-border text-xs font-mono print:hidden">
      <div className="flex-shrink-0 p-2 border-b border-code-border/50 flex justify-between items-center">
        <span className="text-code-text-secondary font-semibold">Console Output</span>
        <button
          onClick={onClear}
          className="p-1.5 text-code-text-secondary hover:text-code-text rounded-full hover:bg-code-highlight-bg focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Clear console output"
        >
          <span className="material-symbols-outlined text-lg leading-none">delete_sweep</span>
        </button>
      </div>
      <div ref={scrollRef} className="flex-grow p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-code-border scrollbar-track-transparent">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start mb-1.5">
            <div className={`flex items-start w-full ${getLevelColor(msg.level)}`}>
              <span className="text-code-text-secondary/70 mr-2 select-none">{msg.timestamp}</span>
              <span className="font-bold mr-1 select-none">{`[${msg.level.toUpperCase()}]`}</span>
              <div className="flex-grow">{formatPayload(msg.payload)}</div>
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <div className="pl-4 mt-1 w-full">
                  <div className="text-teal-500 text-xs font-semibold flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">travel_explore</span>
                    Sources from Web Search:
                  </div>
                  <ul className="list-none pl-4 space-y-0.5 mt-0.5">
                      {msg.sources.map((source, index) => (
                          <li key={index} className="text-xs text-sky-500 hover:text-sky-400">
                              <a href={source.uri} target="_blank" rel="noopener noreferrer" className="truncate block" title={source.uri}>
                                  {index + 1}. {source.title || source.uri}
                              </a>
                          </li>
                      ))}
                  </ul>
              </div>
            )}
          </div>
        ))}
         {messages.length === 0 && <p className="text-code-text-secondary/70 italic">Console is empty.</p>}
      </div>
    </div>
  );
};
