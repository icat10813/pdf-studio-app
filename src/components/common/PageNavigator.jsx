import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Page Navigator - GOJEK STYLE
 */
export const PageNavigator = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    compact = false 
}) => {
    const [inputValue, setInputValue] = useState(String(currentPage));

    useEffect(() => {
        setInputValue(String(currentPage));
    }, [currentPage]);

    if (!totalPages || totalPages <= 1) {
        return (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold text-center py-2">
                Halaman 1 dari 1
            </div>
        );
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const commitPageJump = () => {
        let page = parseInt(inputValue, 10);
        if (isNaN(page)) {
            setInputValue(String(currentPage));
            return;
        }
        page = Math.max(1, Math.min(totalPages, page));
        setInputValue(String(page));
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitPageJump();
        }
    };

    return (
        <div className="w-full flex flex-col gap-3 p-3 bg-white dark:bg-[#1C1C1C] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-black/20 overflow-hidden box-border">
            
            {/* Baris 1: Kontrol Halaman Utama */}
            <div className="flex items-center justify-between gap-2 w-full px-1">
                
                {/* Tombol Sebelumnya (Bulat) */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="h-10 w-10 bg-gray-100 dark:bg-[#2C2C2C] hover:bg-[#E5F7E8] dark:hover:bg-[#143B20] hover:text-[#00AA13] rounded-full text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Halaman Sebelumnya"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Indikator Halaman (Pill Box) */}
                <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-full">
                    <span className="text-xs font-bold text-gray-500">Hal</span>
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={commitPageJump}
                        onKeyDown={handleKeyDown}
                        className="w-10 h-7 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#3C3C3C] focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] rounded-md text-center font-bold text-gray-900 dark:text-white text-[13px] outline-none transition-all"
                    />
                    <span className="text-xs font-bold text-gray-400">/ {totalPages}</span>
                </div>

                {/* Tombol Selanjutnya (Bulat) */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-10 w-10 bg-gray-100 dark:bg-[#2C2C2C] hover:bg-[#E5F7E8] dark:hover:bg-[#143B20] hover:text-[#00AA13] rounded-full text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Halaman Selanjutnya"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Baris 2: Slider (Hanya muncul jika halaman lebih dari 2) */}
            {totalPages > 2 && (
                <div className="flex items-center gap-3 pt-3 px-2 border-t border-gray-100 dark:border-[#2C2C2C] w-full">
                    {/* Ke Awal */}
                    <button
                        type="button"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                        className="text-gray-400 hover:text-[#00AA13] disabled:opacity-20 shrink-0 transition-colors"
                        title="Halaman Pertama"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>

                    {/* Slider ala Gojek (Hijau) */}
                    <input
                        type="range"
                        min={1}
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-[#3C3C3C] rounded-full appearance-none cursor-pointer accent-[#00AA13]"
                        title={`Geser halaman (${currentPage}/${totalPages})`}
                    />

                    {/* Ke Akhir */}
                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="text-gray-400 hover:text-[#00AA13] disabled:opacity-20 shrink-0 transition-colors"
                        title="Halaman Terakhir"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PageNavigator;