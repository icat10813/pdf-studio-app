import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FilePlus } from 'lucide-react'; // Menambahkan ikon FilePlus

/**
 * Reusable Drag-and-Drop file uploader component - GOJEK STYLE
 */
export const FileUploader = ({ onFilesAccepted, accept, multiple = false, text }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFilesAccepted,
        accept,
        multiple
    });

    return (
        <div
            {...getRootProps()}
            className={`w-full relative overflow-hidden p-8 md:p-12 border-2 rounded-3xl text-center cursor-pointer transition-all duration-200 ease-in-out group select-none
                ${isDragActive 
                    ? 'border-[#00AA13] bg-[#E5F7E8] dark:bg-[#143B20]/40 scale-[0.98]' 
                    : 'border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1C1C1C] hover:border-[#00AA13] hover:bg-gray-50 dark:hover:bg-[#252525]'
                }`}
        >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center pointer-events-none relative z-10">
                
                {/* Ikon Lingkaran Khas Gojek */}
                <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-5 transition-transform duration-300 ${
                    isDragActive 
                        ? 'bg-[#00AA13] text-white scale-110' 
                        : 'bg-[#E5F7E8] dark:bg-[#143B20] text-[#00AA13] group-hover:scale-110'
                }`}>
                    {isDragActive ? (
                        <FilePlus className="w-10 h-10" />
                    ) : (
                        <UploadCloud className="w-10 h-10" />
                    )}
                </div>

                {/* Teks Utama (Bold) */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {text || "Tarik & taruh dokumen di sini"}
                </h3>
                
                {/* Sub Teks */}
                <p className="text-sm md:text-base font-medium text-gray-500 dark:text-gray-400 mb-6">
                    atau klik tombol di bawah untuk mencari di folder Anda
                </p>

                {/* Tombol Palsu ala Gojek (Hanya visual, karena seluruh kotak bisa diklik) */}
                <div className="inline-flex items-center justify-center px-6 py-3 bg-[#00AA13] text-white font-bold text-sm md:text-base rounded-full shadow-md shadow-green-600/20 group-hover:bg-[#008F10] transition-colors">
                    Pilih Dokumen
                </div>

                {/* Info Format & Jumlah File */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {multiple ? 'BISA PILIH BANYAK FILE' : 'HANYA SATU FILE'}
                    </span>
                    
                    {accept && (
                        <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                            {Object.values(accept).flat().map((format, idx) => (
                                <span key={idx} className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 dark:bg-[#2C2C2C] text-gray-500 dark:text-gray-400 rounded-lg">
                                    {format.replace('.', '').toUpperCase()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Latar belakang aksen gelombang saat di-drag (Opsional, menambah kesan interaktif) */}
            {isDragActive && (
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#00AA13] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            )}
        </div>
    );
};

export default FileUploader;