import React from 'react';

const badgeStyles = {
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    teal: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    violet: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    rose: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
};

/**
 * Modern High-Polish Tool Card Component (Light & Dark Theme Ready)
 */
export const ToolCard = ({ tool, onSelect }) => {
    const IconComponent = tool.icon;
    const badgeClass = badgeStyles[tool.badgeColor] || badgeStyles.blue;

    return (
        <button
            onClick={() => onSelect(tool.slug)}
            className="flex flex-col text-left p-6 bg-white dark:bg-gray-800/90 rounded-3xl border border-gray-100 dark:border-gray-700/80 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-200 group w-full cursor-pointer relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        >
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between w-full mb-4">
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-all duration-200 shadow-2xs group-hover:scale-105">
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                </div>

                {tool.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs ${badgeClass}`}>
                        {tool.badge}
                    </span>
                )}
            </div>

            {/* Title & Description */}
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                <span>{tool.name}</span>
                <span className="text-blue-600 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-sm">
                    →
                </span>
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                {tool.description}
            </p>
        </button>
    );
};

export default ToolCard;
