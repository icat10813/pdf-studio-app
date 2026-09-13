import React from 'react';
import { Instagram, ShieldCheck } from 'lucide-react';

/**
 * Modern Application Footer - GOJEK STYLE
 */
export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-[#1C1C1C] border-t border-gray-100 dark:border-[#2C2C2C] mt-24 py-10 transition-colors duration-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                
                {/* Bagian Atas Footer (Info & Social) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
                    
                    {/* Brand & Security Note */}
                    <div className="space-y-3 max-w-md">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">
                                PDF Studio
                            </span>
                            <span className="text-[10px] font-bold bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Versi 2.0
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            Platform PDF andalanmu. Semua proses dilakukan langsung di browser. 
                            <span className="text-gray-900 dark:text-white font-bold ml-1">100% Aman & Privat.</span>
                        </p>
                    </div>

                    {/* Social Media Link (Pill Button) */}
                    <div className="flex w-full md:w-auto">
                        <a
                            href="https://www.instagram.com/ricadagustinreal/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gray-50 dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#353535] text-gray-900 dark:text-white font-bold text-sm transition-colors border border-gray-200 dark:border-transparent"
                            title="Ikuti di Instagram"
                        >
                            <Instagram className="h-5 w-5 text-[#00AA13]" />
                            <span>Ikuti Update Terbaru</span>
                        </a>
                    </div>
                </div>

                {/* Garis Pemisah (Divider) */}
                <div className="h-px w-full bg-gray-100 dark:bg-[#2C2C2C] mb-8"></div>

                {/* Bagian Bawah Footer (Copyright & Badge) */}
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                    
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} PDF Studio by Ricad Agus Setiawan.
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <ShieldCheck className="h-4 w-4 text-[#00AA13]" />
                        <span>Dipercaya & Aman</span>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
};

export default Footer;