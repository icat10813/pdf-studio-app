import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, CornerDownLeft, ArrowRight } from 'lucide-react';
import { tools } from '../../config/tools.js';

/**
 * Spotlight-Style Cmd+K / Ctrl+K Command Palette - GOJEK STYLE
 */
export const CommandPalette = ({ isOpen, onClose, onSelectTool }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Filter tools based on query
    const filteredTools = React.useMemo(() => {
        if (!query.trim()) return tools.slice(0, 8); // Top 8 by default
        const q = query.toLowerCase().trim();
        return tools.filter(t => 
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.badge && t.badge.toLowerCase().includes(q))
        );
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle Keyboard Navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredTools.length));
                // Scroll into view logic can be added here
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredTools[selectedIndex]) {
                    onSelectTool(filteredTools[selectedIndex].slug);
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredTools, onSelectTool, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center sm:pt-20 bg-black/50 sm:px-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click */}
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-white dark:bg-[#1C1C1C] rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col max-h-[85vh] sm:max-h-[70vh]">
                
                {/* Visual Handle (Pill) for Mobile (Gojek Style Bottom Sheet) */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Search Bar Input - Gojek Style (Clean, Bold, Large) */}
                <div className="relative flex items-center px-4 py-3 sm:p-5 border-b-4 border-gray-50 dark:border-[#2C2C2C]">
                    <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#2C2C2C] rounded-2xl px-4 py-3">
                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            id="palette-search-input"
                            name="command-palette-search"
                            aria-label="Cari layanan"
                            autoComplete="off"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            placeholder="Cari fitur PDF..."
                            className="w-full bg-transparent text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none font-bold"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-700 bg-gray-200 rounded-full ml-2">
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    {/* Batal Button for Mobile */}
                    <button onClick={onClose} className="ml-4 text-sm font-bold text-[#00AA13] sm:hidden">
                        Batal
                    </button>
                </div>

                {/* Results List */}
                <div ref={listRef} className="overflow-y-auto px-2 py-2 flex-1 scrollbar-hide">
                    {filteredTools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-[#2C2C2C] rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Pencarian tidak ditemukan</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Coba cari dengan kata kunci lain.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredTools.map((tool, idx) => {
                                const IconComponent = tool.icon || Sparkles;
                                const isSelected = idx === selectedIndex;

                                return (
                                    <button
                                        key={tool.slug}
                                        type="button"
                                        onClick={() => {
                                            onSelectTool(tool.slug);
                                            onClose();
                                        }}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-colors duration-150 cursor-pointer ${
                                            isSelected 
                                                ? 'bg-gray-100 dark:bg-[#2C2C2C]' 
                                                : 'bg-white dark:bg-[#1C1C1C] hover:bg-gray-50 dark:hover:bg-[#2C2C2C]/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Gojek Style Icon Container (Round, Soft Green) */}
                                            <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${
                                                isSelected 
                                                    ? 'bg-[#00AA13] text-white' 
                                                    : 'bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13]'
                                            }`}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate">
                                                        {tool.name}
                                                    </span>
                                                    {tool.badge && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                                            {tool.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate max-w-sm">
                                                    {tool.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Indicator (Arrow or Enter hint) */}
                                        <div className="flex items-center text-gray-300 dark:text-gray-600 shrink-0 pr-1">
                                            {isSelected ? (
                                                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#00AA13]">
                                                    <CornerDownLeft className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <ArrowRight className="h-4 w-4" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Tip (Desktop Only) */}
                <div className="hidden sm:flex px-5 py-3 bg-gray-50 dark:bg-[#252525] border-t border-gray-100 dark:border-[#2C2C2C] items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-[#1C1C1C] shadow-sm border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold">↑</kbd><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-[#1C1C1C] shadow-sm border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold">↓</kbd> Navigasi</span>
                        <span className="flex items-center gap-1"><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-[#1C1C1C] shadow-sm border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold">↵</kbd> Pilih</span>
                        <span className="flex items-center gap-1"><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-[#1C1C1C] shadow-sm border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold">ESC</kbd> Tutup</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;