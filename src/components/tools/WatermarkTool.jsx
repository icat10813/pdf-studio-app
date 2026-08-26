import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import { 
    Droplet, 
    Download, 
    Eye, 
    Sparkles, 
    Sliders, 
    Layers, 
    Move, 
    RotateCw, 
    Grid, 
    FileUp,
    Check
} from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import PageNavigator from '../common/PageNavigator.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

const WATERMARK_COLORS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Black', hex: '#1e293b' },
    { name: 'Gray', hex: '#64748b' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Amber', hex: '#d97706' },
];

const ALIGNMENT_GRID = [
    { id: 'tl', label: 'Top-Left', x: 20, y: 15 },
    { id: 'tc', label: 'Top-Center', x: 50, y: 15 },
    { id: 'tr', label: 'Top-Right', x: 80, y: 15 },
    { id: 'cl', label: 'Center-Left', x: 20, y: 50 },
    { id: 'c',  label: 'Center', x: 50, y: 50 },
    { id: 'cr', label: 'Center-Right', x: 80, y: 50 },
    { id: 'bl', label: 'Bottom-Left', x: 20, y: 85 },
    { id: 'bc', label: 'Bottom-Center', x: 50, y: 85 },
    { id: 'br', label: 'Bottom-Right', x: 80, y: 85 },
];

/**
 * Parses user custom page range string like "1-5, 80-90, 150" into array of 1-based page indices
 */
const parsePageRange = (rangeStr, totalPages) => {
    if (!rangeStr.trim()) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set();
    const parts = rangeStr.split(',');

    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
            const [startStr, endStr] = trimmed.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                    pages.add(i);
                }
            }
        } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num >= 1 && num <= totalPages) {
                pages.add(num);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
};

/**
 * World-Class Watermark Studio with Drag & Drop Moveable Positioning,
 * Multi-Page Permissions, 9-Grid Presets & Responsive Auto-Fit Viewport.
 */
export const WatermarkTool = () => {
    const [file, setFile] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [previewPage, setPreviewPage] = useState(1);
    
    // Watermark Content & Styling
    const [text, setText] = useState('CONFIDENTIAL');
    const [fontSize, setFontSize] = useState(48);
    const [opacity, setOpacity] = useState(0.30);
    const [angle, setAngle] = useState(45);
    const [color, setColor] = useState('#ef4444');

    // Moveable Coordinates (in percent: 0% to 100%)
    const [posX, setPosX] = useState(50);
    const [posY, setPosY] = useState(50);
    const [selectedGrid, setSelectedGrid] = useState('c');

    // Page Range Mode: 'all', 'current', 'custom', 'odd', 'even'
    const [pageMode, setPageMode] = useState('all');
    const [customRange, setCustomRange] = useState('');

    const [status, setStatus] = useState({ type: '', message: '' });

    // Dragging Watermark on Canvas
    const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);
    const canvasRef = useRef(null);
    const pageImageRef = useRef(null);
    const renderTaskRef = useRef(null);
    const containerRef = useRef(null);

    const renderPageForPreview = useCallback(async (selectedFile, pageNum) => {
        try {
            const doc = await loadPdfJsDoc(selectedFile);
            setTotalPages(doc.numPages);
            const page = await doc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.25 });

            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch (_) {}
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const ctx = tempCanvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            const renderTask = page.render({ canvasContext: ctx, viewport });
            renderTaskRef.current = renderTask;

            await renderTask.promise;
            renderTaskRef.current = null;
            pageImageRef.current = tempCanvas;
            drawLiveWatermarkPreview();
        } catch (e) {
            if (e?.name !== 'RenderingCancelledException') {
                console.error("Preview render error:", e);
            }
        }
    }, []);

    const drawLiveWatermarkPreview = useCallback(() => {
        const canvas = canvasRef.current;
        const bgImg = pageImageRef.current;
        if (!canvas || !bgImg) return;

        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0);

        if (!text.trim()) return;

        // Calculate watermark position from posX / posY percentages
        const targetX = (posX / 100) * canvas.width;
        const targetY = (posY / 100) * canvas.height;

        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate((-angle * Math.PI) / 180);
        ctx.font = `bold ${fontSize * (canvas.width / 595)}px sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);

        // Draw active move ring / selection indicator when dragging
        if (isDraggingWatermark) {
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            const textMetrics = ctx.measureText(text);
            const textW = textMetrics.width + 24;
            const textH = fontSize * (canvas.width / 595) + 16;
            ctx.strokeRect(-textW / 2, -textH / 2, textW, textH);
        }

        ctx.restore();
    }, [text, fontSize, opacity, angle, color, posX, posY, isDraggingWatermark]);

    useEffect(() => {
        drawLiveWatermarkPreview();
    }, [drawLiveWatermarkPreview]);

    const onDrop = useCallback(acceptedFiles => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setPreviewPage(1);
        setStatus({ type: '', message: '' });
        renderPageForPreview(selected, 1);
    }, [renderPageForPreview]);

    const handlePreviewPageChange = (newPage) => {
        setPreviewPage(newPage);
        renderPageForPreview(file, newPage);
    };

    // Quick 9-Grid Position Selector
    const handleGridSelect = (grid) => {
        setSelectedGrid(grid.id);
        setPosX(grid.x);
        setPosY(grid.y);
    };

    // Canvas Mouse & Touch Dragging Handlers
    const handleCanvasPointerDown = (e) => {
        setIsDraggingWatermark(true);
        updatePositionFromEvent(e);
    };

    const updatePositionFromEvent = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.clientX ?? 0);
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.clientY ?? 0);

        const x = Math.max(5, Math.min(rect.width - 5, clientX - rect.left));
        const y = Math.max(5, Math.min(rect.height - 5, clientY - rect.top));

        const percentX = Math.round((x / rect.width) * 100);
        const percentY = Math.round((y / rect.height) * 100);

        setPosX(percentX);
        setPosY(percentY);
        setSelectedGrid('custom');
    };

    // Global Drag Listeners
    useEffect(() => {
        if (!isDraggingWatermark) return;

        const onGlobalMove = (e) => {
            updatePositionFromEvent(e);
        };

        const onGlobalUp = () => {
            setIsDraggingWatermark(false);
        };

        window.addEventListener('mousemove', onGlobalMove);
        window.addEventListener('mouseup', onGlobalUp);
        window.addEventListener('touchmove', onGlobalMove, { passive: false });
        window.addEventListener('touchend', onGlobalUp);

        return () => {
            window.removeEventListener('mousemove', onGlobalMove);
            window.removeEventListener('mouseup', onGlobalUp);
            window.removeEventListener('touchmove', onGlobalMove);
            window.removeEventListener('touchend', onGlobalUp);
        };
    }, [isDraggingWatermark]);

    // Apply Watermark & Download Final PDF
    const handleApplyWatermark = async () => {
        if (!file) return;
        if (!text.trim()) {
            setStatus({ type: 'error', message: 'Please enter watermark text.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Applying watermark to selected pages...' });

        try {
            const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const total = pdfDoc.getPageCount();

            // Determine target pages based on permission mode
            let targetPageIndices = [];
            if (pageMode === 'all') {
                targetPageIndices = Array.from({ length: total }, (_, i) => i + 1);
            } else if (pageMode === 'current') {
                targetPageIndices = [previewPage];
            } else if (pageMode === 'odd') {
                targetPageIndices = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 !== 0);
            } else if (pageMode === 'even') {
                targetPageIndices = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 === 0);
            } else if (pageMode === 'custom') {
                targetPageIndices = parsePageRange(customRange, total);
            }

            if (targetPageIndices.length === 0) {
                setStatus({ type: 'error', message: 'No valid pages selected for watermark.' });
                return;
            }

            // Convert hex color to rgb
            const r = parseInt(color.slice(1, 3), 16) / 255;
            const g = parseInt(color.slice(3, 5), 16) / 255;
            const b = parseInt(color.slice(5, 7), 16) / 255;

            const pages = pdfDoc.getPages();

            for (const pageNum of targetPageIndices) {
                const targetPage = pages[pageNum - 1];
                if (!targetPage) continue;

                const { width: pageW, height: pageH } = targetPage.getSize();
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const textHeight = fontSize;

                // Exact coordinate translation from percentages
                const targetX = (posX / 100) * pageW;
                const targetY = pageH - ((posY / 100) * pageH);

                targetPage.drawText(text, {
                    x: targetX - (textWidth / 2) * Math.cos((angle * Math.PI) / 180),
                    y: targetY - (textWidth / 2) * Math.sin((angle * Math.PI) / 180),
                    size: fontSize,
                    font,
                    color: rgb(r, g, b),
                    opacity,
                    rotate: degrees(angle),
                });
            }

            const newPdfBytes = await pdfDoc.save();
            saveAs(new Blob([newPdfBytes], { type: 'application/pdf' }), `watermarked_${file.name}`);
            setStatus({ 
                type: 'success', 
                message: `Successfully stamped watermark across ${targetPageIndices.length} page(s)!` 
            });

        } catch (e) {
            setStatus({ type: 'error', message: `Watermark error: ${e.message}` });
        }
    };

    if (!file) {
        return (
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text="Drag & drop a PDF to customize, position, and stamp watermarks"
            />
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full select-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Sidebar: Controls & Positioning */}
                <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/90 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Watermark Settings
                        </h3>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            <FileUp className="h-3 w-3" /> Change PDF
                        </button>
                    </div>

                    {/* Watermark Text Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Watermark Text
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Position: 9-Grid Quick Placement + Live Drag Indicator */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                            <span>Position & Alignment</span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                                {posX}% X • {posY}% Y
                            </span>
                        </label>

                        {/* 9-Grid Selector */}
                        <div className="grid grid-cols-3 gap-1.5 p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                            {ALIGNMENT_GRID.map(grid => (
                                <button
                                    key={grid.id}
                                    type="button"
                                    onClick={() => handleGridSelect(grid)}
                                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                        selectedGrid === grid.id 
                                            ? 'bg-blue-600 text-white shadow-xs' 
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {grid.label.split('-')[0].slice(0, 1) + (grid.label.split('-')[1] ? grid.label.split('-')[1].slice(0, 1) : '')}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            💡 Tip: You can also <strong>click & drag</strong> the watermark directly on the document preview!
                        </p>
                    </div>

                    {/* Watermark Color Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Ink Color
                        </label>
                        <div className="flex items-center gap-2">
                            {WATERMARK_COLORS.map(c => (
                                <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => setColor(c.hex)}
                                    style={{ backgroundColor: c.hex }}
                                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                                        color === c.hex ? 'scale-125 border-blue-500 ring-2 ring-blue-400' : 'border-white dark:border-gray-700'
                                    }`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sliders: Size, Opacity, Rotation */}
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {/* Font Size */}
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                <span>Font Size</span>
                                <span className="text-blue-600 dark:text-blue-400">{fontSize}pt</span>
                            </div>
                            <input
                                type="range"
                                min={16}
                                max={100}
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Opacity */}
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                <span>Opacity</span>
                                <span className="text-blue-600 dark:text-blue-400">{Math.round(opacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min={5}
                                max={90}
                                value={Math.round(opacity * 100)}
                                onChange={(e) => setOpacity(parseInt(e.target.value, 10) / 100)}
                                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Angle */}
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                <span>Rotation Angle</span>
                                <span className="text-blue-600 dark:text-blue-400">{angle}°</span>
                            </div>
                            <input
                                type="range"
                                min={-90}
                                max={90}
                                value={angle}
                                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                <button type="button" onClick={() => setAngle(0)} className="hover:text-blue-600">0° (Horizontal)</button>
                                <button type="button" onClick={() => setAngle(45)} className="hover:text-blue-600">45° (Diagonal)</button>
                                <button type="button" onClick={() => setAngle(-45)} className="hover:text-blue-600">-45°</button>
                                <button type="button" onClick={() => setAngle(90)} className="hover:text-blue-600">90° (Vertical)</button>
                            </div>
                        </div>
                    </div>

                    {/* Page Range Selection Permissions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Apply To Pages
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {[
                                { id: 'all', label: 'All Pages' },
                                { id: 'current', label: 'Current Page' },
                                { id: 'odd', label: 'Odd Pages' },
                                { id: 'even', label: 'Even Pages' },
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => setPageMode(mode.id)}
                                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                        pageMode === mode.id
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Range Button & Input */}
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => setPageMode('custom')}
                                className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                    pageMode === 'custom'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                Custom Page Range (e.g. 1-10, 80-120)
                            </button>

                            {pageMode === 'custom' && (
                                <input
                                    type="text"
                                    value={customRange}
                                    onChange={(e) => setCustomRange(e.target.value)}
                                    placeholder="e.g. 1-5, 80, 100-150"
                                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-900 border border-blue-400 rounded-xl text-xs font-medium focus:outline-none"
                                />
                            )}
                        </div>
                    </div>

                    {/* Direct Page Jump Navigator Component */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Jump to Preview Page
                        </label>
                        <PageNavigator
                            currentPage={previewPage}
                            totalPages={totalPages}
                            onPageChange={handlePreviewPageChange}
                        />
                    </div>

                    <MessageBox type={status.type} message={status.message} />

                    {/* Apply Button */}
                    <button
                        type="button"
                        onClick={handleApplyWatermark}
                        disabled={status.type === 'loading'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                        <Download className="h-4 w-4" />
                        {status.type === 'loading' ? 'Stamping Watermark...' : 'Download Watermarked PDF'}
                    </button>
                </div>

                {/* Right: Live Interactive Moveable Document Viewport */}
                <div 
                    ref={containerRef}
                    className="lg:col-span-2 p-4 sm:p-6 bg-gray-100 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center overflow-auto shadow-inner"
                >
                    <div className="self-start mb-2 px-3 py-1 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-300 shadow-2xs">
                        Page {previewPage} of {totalPages} • Live Drag to Move
                    </div>

                    <div 
                        onMouseDown={handleCanvasPointerDown}
                        onTouchStart={handleCanvasPointerDown}
                        className="relative border border-gray-300 dark:border-gray-700 shadow-2xl bg-white rounded-lg overflow-hidden cursor-move max-w-full"
                    >
                        <canvas
                            ref={canvasRef}
                            className="block max-w-full h-auto object-contain pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatermarkTool;
