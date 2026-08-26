import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { tools } from '../../config/tools.js';

/**
 * Spotlight-Style Cmd+K / Ctrl+K Command Palette
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
            {/* Backdrop click */}
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                {/* Search Bar Input */}
                <div className="relative flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        id="palette-search-input"
                        name="command-palette-search"
                        aria-label="Search tools or type a command"
                        autoComplete="off"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Type a command or search tools... (e.g. merge, compress, sign, ocr)"
                        className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none font-medium"
                    />
                    {query ? (
                        <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                            ESC
                        </kbd>
                    )}
                </div>

                {/* Results List */}
                <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1">
                    {filteredTools.length === 0 ? (
                        <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">
                            No matching tools found for "{query}".
                        </div>
                    ) : (
                        filteredTools.map((tool, idx) => {
                            const IconComponent = tool.icon;
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
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                                        isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-xl shrink-0 ${
                                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {IconComponent && <IconComponent className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                    {tool.name}
                                                </span>
                                                {tool.badge && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                                        {tool.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-md">
                                                {tool.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-2">
                                        {isSelected && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                                <span>Open</span>
                                                <CornerDownLeft className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer Tip */}
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                        <span><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-[10px]">↑</kbd> <kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-[10px]">↓</kbd> to navigate</span>
                        <span><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-[10px]">↵</kbd> to select</span>
                        <span><kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-[10px]">esc</kbd> to dismiss</span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">PDF Toolkit Pro</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
