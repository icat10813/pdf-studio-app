import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import Hero from './components/common/Hero.jsx';
import ToolGrid from './components/common/ToolGrid.jsx';
import MessageBox from './components/common/MessageBox.jsx';
import CommandPalette from './components/common/CommandPalette.jsx';
import { tools } from './config/tools.js';
import { loadPdfLibraries } from './utils/scriptLoader.js';




const handleToolSelect = (slug) => {
    const tool = tools.find(t => t.slug === slug);
    if (tool) {
        setActiveTool(tool);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // ----- KODE PELACAKAN GOOGLE ADS -----
        // Cek apakah script gtag dari index.html sudah dimuat
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'click_tool', {
                'event_category': 'Engagement',
                'event_label': tool.name, // Akan mengirim data nama alat (misal: "Merge PDF")
            });
        }
        // -------------------------------------
    }
};
/**
 * PDF Toolkit Root Application - GOJEK STYLE
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
        /* Latar Belakang Gojek (Abu-abu sangat muda/Hitam pekat), Warna sorotan teks (Hijau) */
        <div className="min-h-screen flex flex-col bg-[#F9F9F9] dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 antialiased selection:bg-[#00AA13]/30 selection:text-gray-900 dark:selection:text-white transition-colors duration-200">
            
            {/* Global Spotlight Cmd+K Search Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onSelectTool={handleToolSelect}
            />

            {/* Gojek Style Header */}
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
                        {/* Hero Section */}
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
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                        
                        {/* Tool Header Info (Gojek Visual Style) */}
                        <div className="flex flex-col items-center text-center mb-8 sm:mb-10 mt-4 sm:mt-6">
                            
                            {/* Ikon Bulat Besar (Gojek Icon Container) */}
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] mb-4 shadow-sm">
                                {React.createElement(activeTool.icon, { className: "h-10 w-10" })}
                            </div>
                            
                            {/* Judul Tebal */}
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight sm:text-4xl mb-3">
                                {activeTool.name}
                            </h2>
                            
                            {/* Deskripsi */}
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-medium leading-relaxed">
                                {activeTool.description}
                            </p>
                        </div>

                        {/* Tool Canvas / Workspace (Gojek Clean Card) */}
                        <div className="bg-white dark:bg-[#1C1C1C] p-5 sm:p-10 rounded-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.04)] dark:shadow-black/30 transition-colors duration-200">
                            {libsReady ? (
                                React.createElement(activeTool.component, { tool: activeTool })
                            ) : (
                                <MessageBox type="loading" message="Menyiapkan komponen PDF..." />
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