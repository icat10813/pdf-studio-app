import React from 'react';

/**
 * Reusable Alert/Message banner component
 */
export const MessageBox = ({ type, message }) => {
    const baseClasses = "p-4 rounded-lg my-4 text-sm font-medium transition-all";
    
    const typeClasses = {
        error: "bg-red-100 border border-red-400 text-red-800",
        success: "bg-green-100 border border-green-400 text-green-800",
        info: "bg-blue-100 border border-blue-400 text-blue-800",
        warning: "bg-amber-100 border border-amber-400 text-amber-800",
        loading: "bg-yellow-100 border border-yellow-400 text-yellow-800 animate-pulse"
    };

    if (!message) return null;

    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`} role="alert">
            {message}
        </div>
    );
};

export default MessageBox;
