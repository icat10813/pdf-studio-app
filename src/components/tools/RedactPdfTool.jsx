import React, { useState, useCallback, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { ShieldAlert, RotateCcw, Download, Eye, CheckCircle2 } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import PageNavigator from '../common/PageNavigator.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * World-Class PDF Redaction & Blackout Tool with Direct Page Jumping
 */
export const RedactPdfTool = () => {
    const [file, setFile] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [redactions, setRedactions] = useState([]); // [{ id, page, x, y, width, height }]
    const [status, setStatus] = useState({ type: '', message: '' });
    
    // Canvas drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState(null);

    const canvasRef = useRef(null);
    const bgImageRef = useRef(null);

    const renderCurrentPage = useCallback(async (selectedFile, pageNum) => {
        try {
            const doc = await loadPdfJsDoc(selectedFile);
            setTotalPages(doc.numPages);
            const page = await doc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.2 });

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const ctx = tempCanvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport }).promise;
            bgImageRef.current = tempCanvas;
            redrawCanvas();
        } catch (e) {
            console.error("Render page error:", e);
        }
    }, []);

    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const bgImg = bgImageRef.current;
        if (!canvas || !bgImg) return;

        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        const ctx = canvas.getContext('2d');

        // Draw PDF Page
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0);

        // Draw existing redactions for this page
        const pageRedactions = redactions.filter(r => r.page === currentPage);
        ctx.fillStyle = '#000000';
        for (const r of pageRedactions) {
            ctx.fillRect(r.x, r.y, r.width, r.height);
        }

        // Draw currently active dragging rectangle
        if (currentRect) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        }
    }, [redactions, currentPage, currentRect]);

    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    const onDrop = useCallback(acceptedFiles => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setRedactions([]);
        setCurrentPage(1);
        setStatus({ type: '', message: '' });
        renderCurrentPage(selected, 1);
    }, [renderCurrentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        renderCurrentPage(file, newPage);
    };

    // Mouse Events for drawing redaction boxes
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setStartPos({ x, y });
        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);

        setCurrentRect({ x, y, width, height });
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        if (currentRect && currentRect.width > 5 && currentRect.height > 5) {
            setRedactions(prev => [
                ...prev,
                {
                    id: `redact-${Date.now()}-${Math.random()}`,
                    page: currentPage,
                    x: currentRect.x,
                    y: currentRect.y,
                    width: currentRect.width,
                    height: currentRect.height,
                    canvasWidth: canvasRef.current.width,
                    canvasHeight: canvasRef.current.height
                }
            ]);
        }
        setIsDrawing(false);
        setCurrentRect(null);
    };

    const undoLastRedaction = () => {
        setRedactions(prev => {
            const pageRedactions = prev.filter(r => r.page === currentPage);
            if (pageRedactions.length === 0) return prev;
            const last = pageRedactions[pageRedactions.length - 1];
            return prev.filter(r => r.id !== last.id);
        });
    };

    const clearAllPageRedactions = () => {
        setRedactions(prev => prev.filter(r => r.page !== currentPage));
    };

    const handleApplyRedactions = async () => {
        if (!file || redactions.length === 0) {
            setStatus({ type: 'error', message: 'No redactions drawn yet. Click & drag to black out text.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Permanently burning blackout redactions into PDF...' });

        try {
            const { PDFDocument, rgb } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            for (const r of redactions) {
                const targetPage = pages[r.page - 1];
                if (!targetPage) continue;

                const { width: pageWidth, height: pageHeight } = targetPage.getSize();

                // Scale canvas coordinates to PDF coordinate space
                const scaleX = pageWidth / r.canvasWidth;
                const scaleY = pageHeight / r.canvasHeight;

                const pdfX = r.x * scaleX;
                const pdfWidth = r.width * scaleX;
                const pdfHeight = r.height * scaleY;
                const pdfY = pageHeight - (r.y * scaleY) - pdfHeight;

                // Draw permanent opaque blackout rectangle
                targetPage.drawRectangle({
                    x: pdfX,
                    y: pdfY,
                    width: pdfWidth,
                    height: pdfHeight,
                    color: rgb(0, 0, 0),
                    opacity: 1.0,
                });
            }

            const newPdfBytes = await pdfDoc.save();
            saveAs(new Blob([newPdfBytes], { type: 'application/pdf' }), `redacted_${file.name}`);
            setStatus({ 
                type: 'success', 
                message: `Successfully applied ${redactions.length} permanent blackout redactions!` 
            });

        } catch (e) {
            setStatus({ type: 'error', message: `Redaction error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to blackout & redact sensitive content"}
            />

            {file && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Controls Sidebar */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" /> Redaction Tools
                        </h3>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            Click and drag your mouse over any sensitive numbers, names, or text on the canvas to place a permanent blackout box.
                        </p>

                        <div className="p-3 bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-300 font-medium">
                            Total Redactions: <span className="font-bold text-red-900 dark:text-white">{redactions.length}</span> ({redactions.filter(r => r.page === currentPage).length} on this page)
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={undoLastRedaction}
                                disabled={redactions.filter(r => r.page === currentPage).length === 0}
                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Undo
                            </button>
                            <button
                                onClick={clearAllPageRedactions}
                                disabled={redactions.filter(r => r.page === currentPage).length === 0}
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 disabled:opacity-40 rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                            >
                                Clear Page
                            </button>
                        </div>

                        {/* Direct Page Jump Navigator Component */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Jump to Page
                            </label>
                            <PageNavigator
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>

                        <MessageBox type={status.type} message={status.message} />

                        <button
                            onClick={handleApplyRedactions}
                            disabled={redactions.length === 0 || status.type === 'loading'}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Download className="h-4 w-4" />
                            {status.type === 'loading' ? 'Burning Redactions...' : 'Apply Redaction & Download PDF'}
                        </button>
                    </div>

                    {/* Interactive Redaction Canvas */}
                    <div className="lg:col-span-2 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-center overflow-auto">
                        <div className="border border-gray-300 dark:border-gray-700 bg-white rounded-lg shadow-lg max-h-[580px] overflow-auto">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                className="cursor-crosshair block select-none"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RedactPdfTool;
