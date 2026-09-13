import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Reusable Alert/Message banner component - GOJEK STYLE
 */
export const MessageBox = ({ type, message }) => {
    // Definisi gaya (tanpa border, background sangat soft, warna teks lebih solid)
    const baseClasses = "flex items-start md:items-center gap-3 p-4 rounded-2xl my-4 text-[13px] md:text-sm font-bold transition-all duration-300 shadow-sm";
    
    const typeConfig = {
        error: {
            classes: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
            icon: <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 md:mt-0" />
        },
        success: {
            // Menggunakan warna Hijau Gojek untuk success
            classes: "bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] dark:text-[#42E659]",
            icon: <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 md:mt-0" />
        },
        info: {
            classes: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
            icon: <Info className="h-5 w-5 shrink-0 mt-0.5 md:mt-0" />
        },
        warning: {
            classes: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500",
            icon: <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 md:mt-0" />
        },
        loading: {
            classes: "bg-gray-100 dark:bg-[#2C2C2C] text-gray-700 dark:text-gray-300",
            icon: <Loader2 className="h-5 w-5 shrink-0 mt-0.5 md:mt-0 animate-spin" />
        }
    };

    if (!message) return null;

    const currentConfig = typeConfig[type] || typeConfig.info;

    return (
        <div className={`${baseClasses} ${currentConfig.classes}`} role="alert">
            {currentConfig.icon}
            <div className="leading-relaxed leading-tight">
                {message}
            </div>
        </div>
    );
};

export default MessageBox;