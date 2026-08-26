import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Responsive & Overflow-Proof Page Navigator for Sidebars & Toolbars
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
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center py-1">
                Page 1 of 1
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
        <div className="w-full flex flex-col gap-2 p-2.5 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden box-border">
            {/* Row 1: Prev, Direct Input, Next */}
            <div className="flex items-center justify-between gap-1 w-full">
                {/* Prev Button */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="h-8 px-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Previous Page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Direct Jump Box: [ 80 ] of 212 */}
                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-0">
                    <span className="text-[11px] text-gray-500">Page</span>
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={commitPageJump}
                        onKeyDown={handleKeyDown}
                        className="w-12 h-7 px-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-center font-bold text-gray-900 dark:text-white text-xs outline-none"
                        title="Type page number and press Enter"
                    />
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">/ {totalPages}</span>
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-8 px-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Next Page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Row 2: Quick First/Last + Scrubbing Slider */}
            {totalPages > 2 && (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/60 w-full">
                    <button
                        type="button"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                        className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 shrink-0"
                        title="First Page"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>

                    <input
                        type="range"
                        min={1}
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-blue-600"
                        title={`Scrub page (${currentPage}/${totalPages})`}
                    />

                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 shrink-0"
                        title="Last Page"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PageNavigator;
