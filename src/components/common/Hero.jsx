import React from 'react';
import { Search, Sparkles, FolderKanban, ArrowLeftRight, ShieldCheck, Cpu, X, Command } from 'lucide-react';
import { categories } from '../../config/categories.js';

const categoryIcons = {
    all: Sparkles,
    organize: FolderKanban,
    convert: ArrowLeftRight,
    security: ShieldCheck,
    ai: Cpu
};

/**
 * Modern SaaS Hero Banner with Real-Time Search and Category Filter Tabs
 */
export const Hero = ({ 
    searchQuery, 
    onSearchChange, 
    selectedCategory, 
    onCategorySelect,
    totalToolsCount,
    toolsByCategory
}) => {
    return (
        <div className="text-center max-w-4xl mx-auto mb-10 pt-4">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4 shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                100% Client-Side Private Processing • Zero Cloud Uploads
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                All-in-One <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">PDF Studio</span>
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-normal">
                Merge, compress, sign, organize, convert, and OCR documents with client-side privacy.
            </p>

            {/* Interactive Search Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        id="hero-search-input"
                        name="search"
                        aria-label="Search any PDF tool"
                        autoComplete="off"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search any PDF tool (or press ⌘K)..."
                        className="w-full pl-11 pr-20 py-3.5 bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium text-gray-900 dark:text-white transition-all outline-none"
                    />
                    <div className="absolute right-3.5 flex items-center gap-1.5">
                        {searchQuery ? (
                            <button
                                onClick={() => onSearchChange('')}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : (
                            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-sans font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded">
                                ⌘K
                            </kbd>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {categories.map(cat => {
                    const IconComponent = categoryIcons[cat.id] || Sparkles;
                    const isSelected = selectedCategory === cat.id;
                    const count = cat.id === 'all' 
                        ? totalToolsCount 
                        : (toolsByCategory[cat.id]?.length || 0);

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onCategorySelect(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isSelected
                                    ? 'bg-gray-900 dark:bg-blue-600 text-white shadow-md shadow-gray-900/10 dark:shadow-blue-600/20 scale-102'
                                    : 'bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <IconComponent className={`h-3.5 w-3.5 ${isSelected ? 'text-blue-400 dark:text-white' : 'text-gray-400'}`} />
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-gray-800 dark:bg-blue-700 text-gray-300 dark:text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Hero;
