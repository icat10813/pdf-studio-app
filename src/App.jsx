import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import Hero from './components/common/Hero.jsx';
import ToolGrid from './components/common/ToolGrid.jsx';
import MessageBox from './components/common/MessageBox.jsx';
import CommandPalette from './components/common/CommandPalette.jsx';
import { tools } from './config/tools.js';
import { loadPdfLibraries } from './utils/scriptLoader.js';

/**
 * PDF Toolkit Root Application
 */
const App = () => {
    const [activeTool, setActiveTool] = useState(null);
    const [libsReady, setLibsReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Theme Management (Light / Dark)
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('pdf_toolkit_theme');
        if (saved) return saved;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('pdf_toolkit_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Global Cmd+K / Ctrl+K keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        loadPdfLibraries().then(() => {
            setLibsReady(true);
        });
    }, []);

    // Group tools by category for tab counts
    const toolsByCategory = useMemo(() => {
        const map = {
            organize: [],
            convert: [],
            security: [],
            ai: []
        };
        tools.forEach(t => {
            if (map[t.category]) {
                map[t.category].push(t);
            }
        });
        return map;
    }, []);

    // Filter tools based on category and search text
    const filteredTools = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return tools.filter(tool => {
            const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!query) return true;

            return (
                tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.slug.toLowerCase().includes(query) ||
                (tool.badge && tool.badge.toLowerCase().includes(query))
            );
        });
    }, [searchQuery, selectedCategory]);

    const handleToolSelect = (slug) => {
        const tool = tools.find(t => t.slug === slug);
        if (tool) {
            setActiveTool(tool);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setActiveTool(null);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] font-sans text-gray-800 dark:text-gray-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
            {/* Global Spotlight Cmd+K Search Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onSelectTool={handleToolSelect}
            />

            {/* SaaS Header */}
            <Header 
                activeTool={activeTool} 
                onBack={handleBack} 
                theme={theme} 
                onToggleTheme={toggleTheme}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                {!activeTool ? (
                    <div>
                        {/* Hero Section with Search & Category Pills */}
                        <Hero
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedCategory={selectedCategory}
                            onCategorySelect={setSelectedCategory}
                            totalToolsCount={tools.length}
                            toolsByCategory={toolsByCategory}
                        />

                        {/* Filtered Tool Grid */}
                        <ToolGrid
                            tools={filteredTools}
                            onSelect={handleToolSelect}
                            onResetFilters={handleResetFilters}
                        />
                    </div>
                ) : (
                    /* Active Tool Workspace */
                    <div className="max-w-5xl mx-auto animate-in fade-in duration-200">
                        {/* Tool Header Info */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3 shadow-2xs">
                                {React.createElement(activeTool.icon, { className: "h-7 w-7" })}
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                                {activeTool.name}
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                                {activeTool.description}
                            </p>
                        </div>

                        {/* Tool Canvas / Workspace */}
                        <div className="bg-white dark:bg-gray-800/90 p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100/80 dark:border-gray-700/80 transition-colors duration-200">
                            {libsReady ? (
                                React.createElement(activeTool.component, { tool: activeTool })
                            ) : (
                                <MessageBox type="loading" message="Initializing high-performance PDF processing engine..." />
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default App;
