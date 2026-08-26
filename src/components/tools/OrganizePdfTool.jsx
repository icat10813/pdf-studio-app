import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Trash2, ArrowLeft, ArrowRight, RotateCw, Copy, ArrowDownUp, Check } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { generatePdfThumbnails } from '../../utils/pdfHelpers.js';

/**
 * World-Class PDF Organizer Tool: Reorder, Rotate, Duplicate, and Delete Pages
 */
export const OrganizePdfTool = () => {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(async (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setStatus({ type: 'loading', message: 'Generating page previews...' });

        try {
            const thumbnails = await generatePdfThumbnails(selectedFile, 0.4);
            setPages(thumbnails);
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF pages: ${e.message}` });
        }
    }, []);

    const deletePage = (id) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const duplicatePage = (index) => {
        const pageToDup = pages[index];
        const newPage = {
            ...pageToDup,
            id: `page-${pageToDup.pageNum}-dup-${Date.now()}`
        };
        const updated = [...pages];
        updated.splice(index + 1, 0, newPage);
        setPages(updated);
    };

    const rotatePage = (index) => {
        setPages(prev => prev.map((p, i) => {
            if (i === index) {
                return { ...p, rotation: (p.rotation + 90) % 360 };
            }
            return p;
        }));
    };

    const movePage = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= pages.length) return;
        const updated = [...pages];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setPages(updated);
    };

    const reversePages = () => {
        setPages(prev => [...prev].reverse());
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) {
            setStatus({ type: 'error', message: 'No pages remaining in document.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Reorganizing and compiling PDF...' });
        try {
            const { PDFDocument, degrees } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const originalDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const newDoc = await PDFDocument.create();

            for (const item of pages) {
                const [copiedPage] = await newDoc.copyPages(originalDoc, [item.originalIndex]);
                if (item.rotation) {
                    const currentRot = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees((currentRot + item.rotation) % 360));
                }
                newDoc.addPage(copiedPage);
            }

            const newPdfBytes = await newDoc.save();
            saveAs(new Blob([newPdfBytes], { type: 'application/pdf' }), `organized_${file.name}`);
            setStatus({ type: 'success', message: `Organized PDF saved successfully with ${pages.length} pages!` });
        } catch (e) {
            setStatus({ type: 'error', message: `Failed to compile PDF: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to organize and reorder pages"}
            />

            <MessageBox type={status.type} message={status.message} />

            {pages.length > 0 && (
                <div className="mt-6 space-y-4">
                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-sm font-bold text-gray-800">
                            Total Pages: <span className="text-blue-600">{pages.length}</span>
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={reversePages}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                                <ArrowDownUp className="h-3.5 w-3.5" /> Reverse Order
                            </button>
                        </div>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {pages.map((page, idx) => (
                            <div
                                key={page.id}
                                className="relative bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-2 shadow-sm transition-all group flex flex-col justify-between"
                            >
                                {/* Thumbnail Image Container with CSS rotation */}
                                <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                    <img
                                        src={page.dataUrl}
                                        alt={`Page ${page.pageNum}`}
                                        style={{ transform: `rotate(${page.rotation}deg)` }}
                                        className="w-full h-full object-contain transition-transform duration-200"
                                    />
                                    {page.rotation !== 0 && (
                                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                            {page.rotation}°
                                        </span>
                                    )}
                                </div>

                                {/* Page Label & Card Toolbar */}
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1 mb-1.5">
                                        <span>#{idx + 1} <span className="text-gray-400 font-normal">(p.{page.pageNum})</span></span>
                                        <button
                                            onClick={() => deletePage(page.id)}
                                            className="text-red-500 hover:text-red-700 p-0.5 rounded"
                                            title="Delete page"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-4 gap-1">
                                        <button
                                            onClick={() => movePage(idx, -1)}
                                            disabled={idx === 0}
                                            className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-700 flex items-center justify-center"
                                            title="Move Left"
                                        >
                                            <ArrowLeft className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => rotatePage(idx)}
                                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded flex items-center justify-center"
                                            title="Rotate 90°"
                                        >
                                            <RotateCw className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => duplicatePage(idx)}
                                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center"
                                            title="Duplicate"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => movePage(idx, 1)}
                                            disabled={idx === pages.length - 1}
                                            className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-700 flex items-center justify-center"
                                            title="Move Right"
                                        >
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={status.type === 'loading' || pages.length === 0}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <Check className="h-4 w-4" />
                        {status.type === 'loading' ? 'Saving Document...' : `Save & Download Organized PDF (${pages.length} Pages)`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrganizePdfTool;
