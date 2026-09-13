import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import ToolCard from './ToolCard.jsx';

/**
 * Filterable Categorized Grid Layout for PDF Tools - GOJEK STYLE
 */
export const ToolGrid = ({ tools, onSelect, onResetFilters }) => {
    
    // Empty State ala Gojek (Tidak Ditemukan)
    if (tools.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white dark:bg-[#1C1C1C] rounded-[32px] max-w-lg mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-black/20 mt-8 mb-12">
                
                {/* Ikon Lingkaran Besar (Gojek Visual Style) */}
                <div className="flex items-center justify-center w-[88px] h-[88px] rounded-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-400 dark:text-gray-500 mb-6">
                    <SearchX className="h-10 w-10" />
                </div>
                
                {/* Judul & Deskripsi (Tebal & Clean) */}
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                    Fitur Tidak Ditemukan
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] leading-relaxed font-medium">
                    Coba gunakan kata kunci lain atau lihat semua kategori alat PDF yang tersedia.
                </p>
                
                {/* Tombol Utama ala Gojek (Pill, Hijau Solid, Bold) */}
                <button
                    onClick={onResetFilters}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00AA13] hover:bg-[#008F10] text-white rounded-full text-[15px] font-bold transition-all shadow-md shadow-green-600/20 active:scale-95"
                >
                    <RotateCcw className="h-4 w-4" /> 
                    <span>Lihat Semua Fitur</span>
                </button>
            </div>
        );
    }

    // Grid Layout
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
            {tools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} onSelect={onSelect} />
            ))}
        </div>
    );
};

export default ToolGrid;