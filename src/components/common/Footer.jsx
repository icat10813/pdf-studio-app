import React from 'react';
import { ShieldCheck, Heart, Sparkles, Coffee, Linkedin, Github } from 'lucide-react';

/**
 * Modern Application Footer (Light & Dark Theme Ready)
 */
export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-20 py-12 transition-colors duration-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand and security note */}
                    <div className="space-y-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">PDF Toolkit Studio</span>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.2 rounded-full font-bold">
                                v2.0
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                            All PDF conversions, compression, signatures, and edits are executed locally inside your browser sandbox. 100% Private.
                        </p>
                    </div>

                    {/* Developer Credits, LinkedIn & Coffee */}
                    <div className="flex flex-col items-center md:items-end gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <a
                                href="https://www.linkedin.com/in/yashdhanani/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-all hover:scale-102"
                                title="Connect on LinkedIn"
                            >
                                <Linkedin className="h-3.5 w-3.5 fill-current" />
                                <span>LinkedIn</span>
                            </a>

                            <a
                                href="https://github.com/yashdhanani"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs border border-gray-200 dark:border-gray-700 transition-all hover:scale-102"
                                title="Follow on GitHub"
                            >
                                <Github className="h-3.5 w-3.5" />
                                <span>GitHub</span>
                            </a>

                            <a
                                href="https://www.buymeacoffee.com/dhananiyash"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFDD00] hover:bg-[#ffe433] text-gray-900 font-bold text-xs shadow-2xs hover:scale-102 transition-all"
                                title="Buy me a coffee"
                            >
                                <Coffee className="h-3.5 w-3.5 text-gray-900" />
                                <span>Buy me a coffee</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                            <span>Crafted with</span>
                            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                            <span>by <a href="https://www.linkedin.com/in/yashdhanani/" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline decoration-blue-400">Yash Dhanani</a></span>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            &copy; {new Date().getFullYear()} PDF Toolkit • Free & Open Source
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
