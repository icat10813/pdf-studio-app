import React from 'react';

// Mengadaptasi warna badge agar cocok dengan ekosistem Gojek (lebih vibrant dan solid)
const badgeStyles = {
    green: 'bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] dark:text-[#42E659]',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-100 dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300',
    // Fallback default
    blue: 'bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] dark:text-[#42E659]', 
};

/**
 * Modern High-Polish Tool Card Component - GOJEK STYLE
 */
export const ToolCard = ({ tool, onSelect }) => {
    const IconComponent = tool.icon;
    // Gunakan warna asli jika ada di map baru, jika tidak fallback ke hijau Gojek (di mapping ke "blue" agar kompatibel dgn data lama)
    const badgeClass = badgeStyles[tool.badgeColor] || badgeStyles.green;

    return (
        <button
            onClick={() => onSelect(tool.slug)}
            className="flex flex-col text-left p-5 sm:p-6 bg-white dark:bg-[#1C1C1C] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 group w-full cursor-pointer relative overflow-hidden focus:outline-none"
        >
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between w-full mb-4">
                
                {/* Ikon dalam Lingkaran (Gojek Icon Style) */}
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] group-hover:bg-[#00AA13] group-hover:text-white transition-colors duration-300">
                    {IconComponent && <IconComponent className="h-[26px] w-[26px]" />}
                </div>

                {/* Badge Kapsul (Gojek Label Style) */}
                {tool.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {tool.badge}
                    </span>
                )}
            </div>

            {/* Title & Description */}
            <div className="mt-1">
                {/* Tipografi Judul (Tebal & Bersih) */}
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-[#00AA13] transition-colors leading-tight tracking-tight">
                    {tool.name}
                </h3>

                {/* Deskripsi */}
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium">
                    {tool.description}
                </p>
            </div>
        </button>
    );
};

export default ToolCard;