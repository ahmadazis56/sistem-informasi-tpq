'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: string | number;
  name: string;
  class?: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  name: string;
  required?: boolean;
  defaultValue?: string | number;
  onSelect?: (value: string | number) => void;
}

export default function SearchableSelect({
  options,
  placeholder = '-- Pilih Santri --',
  name,
  required = false,
  defaultValue = '',
  onSelect
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | number>(defaultValue);
  const [selectedLabel, setSelectedLabel] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultValue) {
      const option = options.find(o => String(o.id) === String(defaultValue));
      if (option) {
        setSelectedValue(defaultValue);
        setSelectedLabel(option.class ? `${option.name} (${option.class})` : option.name);
      }
    } else {
      setSelectedValue('');
      setSelectedLabel('');
    }
  }, [defaultValue, options]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.class && option.class.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (option: Option) => {
    setSelectedValue(option.id);
    const label = option.class ? `${option.name} (${option.class})` : option.name;
    setSelectedLabel(label);
    setSearchTerm('');
    setIsOpen(false);
    if (onSelect) {
      onSelect(option.id);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue('');
    setSelectedLabel('');
    setSearchTerm('');
    setIsOpen(false);
    if (onSelect) {
      onSelect('');
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden input to pass value in standard HTML forms */}
      <input type="hidden" name={name} value={selectedValue} required={required} />
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-zinc-800 text-white rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 outline-none bg-zinc-950/90 flex justify-between items-center cursor-pointer min-h-[50px] transition-all"
      >
        <div className="flex-grow pr-2">
          {isOpen ? (
            <input
              type="text"
              className="w-full outline-none text-white bg-transparent placeholder-zinc-500 border-none p-0 focus:ring-0 text-sm"
              placeholder="Ketik untuk mencari nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`text-sm ${selectedLabel ? 'text-white font-medium' : 'text-zinc-500'}`}>
              {selectedLabel || placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
          {selectedLabel && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-red-400 p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <span className="material-symbols-outlined text-[20px] transition-transform duration-200">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-zinc-800/60">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-500 text-center">
              Santri tidak ditemukan
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = String(option.id) === String(selectedValue);
              return (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    isSelected 
                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                      : 'hover:bg-zinc-900 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{option.name}</span>
                    {option.class && (
                      <span className="text-xs bg-zinc-900 text-emerald-400 px-2 py-0.5 rounded border border-zinc-800 font-medium">
                        {option.class}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
