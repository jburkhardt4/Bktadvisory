import { useState, useRef, useEffect } from 'react';

const ChevronDownIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon = ({ size }: { size?: number }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size }: { size?: number }) => (
  <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  placeholder: string;
}

export function MultiSelectDropdown({
  options,
  selected,
  onToggle,
  onClear,
  placeholder,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when tapping outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isOpen]);

  const displayText = selected.length > 0 ? selected.join(', ') : placeholder;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-[10px] border rounded-lg text-left text-base md:text-[14px] transition-colors ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <span className={`truncate ${selected.length > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
          {displayText}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {/* Clear-all X button — only visible when items are selected */}
          {selected.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  onClear();
                }
              }}
              className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Clear all selections"
            >
              <XIcon size={14} />
            </span>
          )}
          <ChevronDownIcon
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[240px] overflow-y-auto overscroll-contain">
          {options.map(option => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-base md:text-[14px] transition-colors border-b border-slate-100 last:border-b-0 ${
                  isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 active:bg-slate-50'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckIcon size={12} />}
                </span>
                <span className="flex-1 text-base md:text-[13px]">{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}