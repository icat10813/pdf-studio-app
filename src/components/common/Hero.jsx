import React from 'react';
import { Search, Sparkles, FolderKanban, ArrowLeftRight, ShieldCheck, Cpu, X, Zap } from 'lucide-react';
import { categories } from '../../config/categories.js';

const categoryIcons = {
    all: Sparkles,
    organize: FolderKanban,
    convert: ArrowLeftRight,
    security: ShieldCheck,
    ai: Cpu
};

/**
 * Hero Banner with Search and Category Filter - GOJEK STYLE
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
        <div className="relative text-center max-w-4xl mx-auto mb-12 pt-8 pb-6 sm:pt-14 sm:pb-10 px-4">
            
            {/* Tag Badge / Promo Label (Gojek Style Promo Badge) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5F7E8] dark:bg-[#143B20] border border-[#00AA13]/20 mb-6 shadow-sm cursor-pointer hover:bg-[#D4F0D9] dark:hover:bg-[#1A4F2A] transition-colors">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00AA13] text-white">
                    <Zap className="h-3 w-3 fill-current" />
                </span>
                <span className="text-xs font-bold text-[#00AA13] dark:text-[#42E659]">
                    Baru: OCR Berbasis AI & Signature Studio!
                </span>
            </div>

            {/* Main Headline (Bold, Solid Color) */}
            <h1 className="text-4xl sm:text-[56px] font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5">
                Beresin PDF kamu <br className="hidden sm:block" />
                <span className="text-[#00AA13]">dalam sekejap.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Platform manipulasi PDF lokal. Merge, compress, sign, organize, dan convert dokumen dengan <strong className="text-gray-900 dark:text-white font-bold">100% aman dan privat</strong>.
            </p>

            {/* Interactive Search Bar (Gojek Style - Thick, Rounded, Bold Input) */}
            <div className="mt-10 max-w-2xl mx-auto relative group">
                <div className="relative flex items-center bg-white dark:bg-[#1C1C1C] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-black/50 border-2 border-transparent focus-within:border-[#00AA13] transition-all duration-300">
                    <Search className="absolute left-6 h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00AA13] transition-colors" />
                    <input
                        type="text"
                        id="hero-search-input"
                        name="search"
                        aria-label="Cari fitur PDF"
                        autoComplete="off"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Mau ngapain dengan PDF-mu hari ini?"
                        className="w-full pl-16 pr-20 py-4 sm:py-[22px] bg-transparent text-base sm:text-lg font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none rounded-[24px]"
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                        {searchQuery ? (
                            <button
                                onClick={() => onSearchChange('')}
                                className="p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        ) : (
                            <kbd className="hidden sm:flex items-center h-8 px-3 text-[11px] font-sans font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                ⌘K
                            </kbd>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Filter Pills (Gojek Style Chips / Tabs) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
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
                            className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                isSelected
                                    ? 'bg-[#00AA13] text-white shadow-md shadow-green-600/20'
                                    : 'bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2C2C2C] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2C] hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <IconComponent className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span>{cat.label}</span>
                            
                            {/* Counter Badge dalam Chip */}
                            <span className={`flex items-center justify-center min-w-[20px] h-5 text-[11px] px-1.5 rounded-full transition-colors ${
                                isSelected 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-gray-100 dark:bg-[#2C2C2C] text-gray-500 dark:text-gray-400'
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