import React from 'react';
import { ArrowLeft, FileText, Linkedin, Instagram, Sun, Moon, Search } from 'lucide-react'; // Pastikan Instagram diimpor di sini

export const Header = ({ activeTool, onBack, theme, onToggleTheme, onOpenCommandPalette }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    
                    {/* Kiri: Brand & Navigasi */}
                    <div className="flex items-center space-x-4">
                        {activeTool ? (
                            <button
                                onClick={onBack}
                                className="group flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all duration-300 cursor-pointer"
                                aria-label="Kembali ke semua alat"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                                <span className="hidden sm:inline ml-2 text-sm font-semibold tracking-wide">Kembali</span>
                            </button>
                        ) : (
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
                                <FileText className="h-5 w-5" />
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight cursor-default">
                                PDF Toolkit
                            </span>
                            {activeTool && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-600 font-light hidden sm:block">/</span>
                                    <span className="hidden sm:inline-flex items-center text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm shadow-inner shadow-blue-500/10">
                                        {activeTool.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Kanan: Fitur Pencarian & Aksi */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        
                        {/* Tombol Pencarian Pintas */}
                        <button
                            onClick={onOpenCommandPalette}
                            className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors"
                        >
                            <Search className="h-4 w-4" />
                            <span>Cari alat...</span>
                            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">⌘K</kbd>
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        {/* Switcher Mode Gelap/Terang */}
                        <button
                            type="button"
                            onClick={onToggleTheme}
                            className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                            aria-label="Toggle theme"
                        >
                            <div className={`absolute transition-all duration-500 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
                                <Sun className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                            </div>
                            <div className={`absolute transition-all duration-500 ${theme === 'dark' ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}>
                                <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                            </div>
                        </button>

                        {/* LinkedIn */}
                        

                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/ricadagustinreal/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-500/30"
                            title="Instagram Profile"
                        >
                            <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="hidden lg:inline ml-2 text-xs font-bold tracking-wide">Instagram</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;