import React, { useState, useCallback, useRef } from 'react';
import { saveAs } from 'file-saver';
import { FileImage, Download, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * Multi-Page PDF to JPG Tool with High DPI options
 */
export const PdfToJpgTool = () => {
    const [file, setFile] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [exportMode, setExportMode] = useState('all'); // 'all', 'single', 'range'
    const [singlePageNum, setSinglePageNum] = useState(1);
    const [pageRange, setPageRange] = useState('');
    const [scaleMultiplier, setScaleMultiplier] = useState(2.0); // 1.0 (Standard), 2.0 (High-Res), 3.0 (Ultra)
    const [status, setStatus] = useState({ type: '', message: '' });
    const [progressText, setProgressText] = useState('');
    const canvasRef = useRef(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: 'loading', message: 'Analyzing PDF document...' });

        try {
            const doc = await loadPdfJsDoc(selected);
            setTotalPages(doc.numPages);
            setSinglePageNum(1);
            setPageRange(`1-${doc.numPages}`);
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not read PDF: ${e.message}` });
        }
    }, []);

    const parsePagesToExport = () => {
        if (exportMode === 'single') return [singlePageNum];
        if (exportMode === 'all') {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        // Parse range e.g. "1, 3-5"
        const pages = new Set();
        const parts = pageRange.split(',').map(p => p.trim());
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                        pages.add(i);
                    }
                }
            } else {
                const num = Number(part);
                if (!isNaN(num) && num >= 1 && num <= totalPages) {
                    pages.add(num);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleExport = async () => {
        if (!file) return;
        const pagesToRender = parsePagesToExport();
        if (pagesToRender.length === 0) {
            setStatus({ type: 'error', message: 'No valid pages selected for export.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Rendering pages to JPG...' });

        try {
            const doc = await loadPdfJsDoc(file);
            const baseFilename = file.name.replace(/\.pdf$/i, '');
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            for (let i = 0; i < pagesToRender.length; i++) {
                const pageNum = pagesToRender[i];
                setProgressText(`Rendering page ${pageNum} (${i + 1} of ${pagesToRender.length})...`);

                const page = await doc.getPage(pageNum);
                const viewport = page.getViewport({ scale: scaleMultiplier });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Ensure white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: ctx, viewport }).promise;

                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                if (blob) {
                    saveAs(blob, `${baseFilename}_page_${pageNum}.jpg`);
                }
            }

            setStatus({ 
                type: 'success', 
                message: `Successfully exported ${pagesToRender.length} page(s) to JPG!` 
            });
        } catch (e) {
            setStatus({ type: 'error', message: `Export error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF to export as JPG"}
            />

            {totalPages > 0 && (
                <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-blue-600" /> Export Configuration (Total {totalPages} Pages)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                            exportMode === 'all' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-300 bg-white'
                        }`}>
                            <input
                                type="radio"
                                name="exportMode"
                                value="all"
                                checked={exportMode === 'all'}
                                onChange={() => setExportMode('all')}
                                className="text-blue-600"
                            />
                            <span className="text-xs font-semibold text-gray-800">All Pages ({totalPages})</span>
                        </label>

                        <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                            exportMode === 'single' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-300 bg-white'
                        }`}>
                            <input
                                type="radio"
                                name="exportMode"
                                value="single"
                                checked={exportMode === 'single'}
                                onChange={() => setExportMode('single')}
                                className="text-blue-600"
                            />
                            <span className="text-xs font-semibold text-gray-800">Single Page</span>
                        </label>

                        <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                            exportMode === 'range' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-300 bg-white'
                        }`}>
                            <input
                                type="radio"
                                name="exportMode"
                                value="range"
                                checked={exportMode === 'range'}
                                onChange={() => setExportMode('range')}
                                className="text-blue-600"
                            />
                            <span className="text-xs font-semibold text-gray-800">Custom Range</span>
                        </label>
                    </div>

                    {exportMode === 'single' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Page Number</label>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={singlePageNum}
                                onChange={e => setSinglePageNum(Number(e.target.value))}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    )}

                    {exportMode === 'range' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Page Ranges (e.g. 1-3, 5)</label>
                            <input
                                type="text"
                                value={pageRange}
                                onChange={e => setPageRange(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Render Resolution Quality
                        </label>
                        <select
                            value={scaleMultiplier}
                            onChange={e => setScaleMultiplier(Number(e.target.value))}
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        >
                            <option value={1.2}>Standard Web (72-96 DPI)</option>
                            <option value={2.0}>High Definition (150-200 DPI — Recommended)</option>
                            <option value={3.0}>Ultra HD Print Quality (300 DPI)</option>
                        </select>
                    </div>
                </div>
            )}

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            <button
                onClick={handleExport}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Download className="h-4 w-4" />
                {status.type === 'loading' ? 'Exporting Images...' : 'Convert & Download JPG Images'}
            </button>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default PdfToJpgTool;
