import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { File as FileIcon, Trash2, ArrowUp, ArrowDown, Sparkles, Layers } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { formatBytes } from '../../utils/pdfHelpers.js';

/**
 * World-Class Merge PDF Tool
 */
export const MergeTool = () => {
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(async (acceptedFiles) => {
        const { PDFDocument } = window.PDFLib || {};
        
        const detailedFiles = await Promise.all(
            acceptedFiles.map(async (file) => {
                let pageCount = null;
                try {
                    if (PDFDocument) {
                        const bytes = await file.arrayBuffer();
                        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
                        pageCount = doc.getPageCount();
                    }
                } catch (e) {
                    console.warn(`Could not read page count for ${file.name}`);
                }
                return {
                    id: `${file.name}-${file.size}-${Date.now()}`,
                    file,
                    name: file.name,
                    size: file.size,
                    pageCount
                };
            })
        );

        setFiles(prev => [...prev, ...detailedFiles]);
        setStatus({ type: '', message: '' });
    }, []);

    const moveFile = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= files.length) return;
        const updated = [...files];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setFiles(updated);
    };

    const removeFile = (id) => {
        setFiles(files.filter(f => f.id !== id));
    };

    const totalPages = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
    const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

    const handleMerge = async () => {
        if (files.length < 2) {
            setStatus({ type: 'error', message: 'Please select at least two PDF files to merge.' });
            return;
        }

        setStatus({ type: 'loading', message: `Merging ${files.length} documents into one...` });
        try {
            const { PDFDocument } = window.PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const item of files) {
                const pdfBytes = await item.file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'merged_document.pdf');
            setStatus({ 
                type: 'success', 
                message: `PDFs merged successfully (${totalPages ? `${totalPages} total pages` : ''})! Download has started.` 
            });
        } catch (e) {
            setStatus({ type: 'error', message: `Merge error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop} 
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={true}
                text="Drag & drop multiple PDFs to combine & merge"
            />

            {files.length > 0 && (
                <div className="mt-6 space-y-4">
                    {/* Header stats */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-blue-600" />
                            {files.length} Files Selected 
                            {totalPages > 0 && <span className="text-gray-500 font-normal">({totalPages} pages total)</span>}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            Total Size: {formatBytes(totalBytes)}
                        </span>
                    </div>

                    {/* File list with reordering */}
                    <ul className="space-y-2 max-h-80 overflow-y-auto">
                        {files.map((item, idx) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-2xs hover:border-gray-300 transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </span>
                                    <FileIcon className="h-5 w-5 text-red-500 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate max-w-sm sm:max-w-md">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatBytes(item.size)} {item.pageCount ? `• ${item.pageCount} pages` : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() => moveFile(idx, -1)}
                                        disabled={idx === 0}
                                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-20"
                                        title="Move Up"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => moveFile(idx, 1)}
                                        disabled={idx === files.length - 1}
                                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-20"
                                        title="Move Down"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => removeFile(item.id)}
                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg ml-1"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleMerge}
                disabled={files.length < 2 || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Sparkles className="h-4 w-4" />
                {status.type === 'loading' ? 'Merging Files...' : `Merge ${files.length} PDF Documents`}
            </button>
        </div>
    );
};

export default MergeTool;
