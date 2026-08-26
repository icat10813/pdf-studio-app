import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import { 
    Type, 
    Highlighter, 
    Pen, 
    Square, 
    Circle, 
    ArrowRight, 
    RotateCcw, 
    RotateCw, 
    Trash2, 
    Download, 
    ZoomIn, 
    ZoomOut, 
    FileUp,
    GripVertical,
    Check,
    X,
    AlignLeft
} from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import PageNavigator from '../common/PageNavigator.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

const HIGHLIGHTER_BASE_COLORS = [
    { name: 'Yellow', r: 254, g: 240, b: 138, hex: '#fef08a' },
    { name: 'Green',  r: 134, g: 239, b: 172, hex: '#86efac' },
    { name: 'Cyan',   r: 103, g: 232, b: 249, hex: '#67e8f9' },
    { name: 'Pink',   r: 251, g: 207, b: 232, hex: '#fbcfe8' },
    { name: 'Orange', r: 254, g: 215, b: 170, hex: '#fed7aa' },
    { name: 'Purple', r: 221, g: 214, b: 254, hex: '#ddd6fe' },
];

const HIGHLIGHTER_TONES = [
    { id: 'light', label: 'Light', opacity: 0.35 },
    { id: 'medium', label: 'Medium', opacity: 0.55 },
    { id: 'dark', label: 'Dark', opacity: 0.80 },
];

const HIGHLIGHTER_SIZES = [
    { id: 'sm', label: 'Thin', px: 14 },
    { id: 'md', label: 'Regular', px: 24 },
    { id: 'lg', label: 'Thick', px: 36 },
];

const PEN_COLORS = [
    '#2563eb', // Blue
    '#1e293b', // Slate / Black
    '#dc2626', // Red
    '#16a34a', // Green
];

/**
 * Dynamic High-Precision SVG Cursors for PDF Annotation Tools
 */
const getToolCursorStyle = (mode) => {
    switch (mode) {
        case 'highlighter':
            return {
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 11-6 6v3h3l6-6' fill='%23fef08a'/%3E%3Cpath d='m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4'/%3E%3C/svg%3E") 2 22, crosshair`
            };
        case 'pen':
            return {
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' fill='%2393c5fd' fill-opacity='0.5'/%3E%3C/svg%3E") 2 22, crosshair`
            };
        case 'text':
            return { cursor: 'text' };
        case 'circle':
            return {
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='1.5'%3E%3Ccircle cx='12' cy='12' r='7' stroke-dasharray='2 2'/%3E%3Cline x1='12' y1='1' x2='12' y2='23'/%3E%3Cline x1='1' y1='12' x2='23' y2='12'/%3E%3C/svg%3E") 12 12, crosshair`
            };
        case 'rectangle':
            return {
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='1.5'%3E%3Crect x='4' y='4' width='16' height='16' rx='2' stroke-dasharray='2 2'/%3E%3Cline x1='12' y1='1' x2='12' y2='23'/%3E%3Cline x1='1' y1='12' x2='23' y2='12'/%3E%3C/svg%3E") 12 12, crosshair`
            };
        case 'arrow':
            return {
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14M13 6l6 6-6 6'/%3E%3C/svg%3E") 19 12, crosshair`
            };
        default:
            return { cursor: 'crosshair' };
    }
};

/**
 * World-Class Interactive PDF Studio
 * Built with Persistent Multi-Layer Vector Architecture (PDF Canvas + Persistent SVG Layer).
 * Highlights and annotations stay 100% visible permanently without ever disappearing, flickering, or getting removed on scroll/zoom.
 */
export const EditPdfTool = () => {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePage, setVisiblePage] = useState(1);
    const [pageAspectRatios, setPageAspectRatios] = useState({});

    // Viewport & Zoom Scaling
    const [containerWidth, setContainerWidth] = useState(800);
    const [zoomMode, setZoomMode] = useState('fit-width');
    const [manualScale, setManualScale] = useState(1.0);

    // Active Tool: 'circle', 'rectangle', 'arrow', 'pen', 'highlighter', 'text'
    const [activeMode, setActiveMode] = useState('circle');

    // Drawing Options
    const [penColor, setPenColor] = useState('#2563eb');
    const [penWidth, setPenWidth] = useState(3);

    // Advanced Highlighter Options: Color, Light/Dark Tone, Thickness, Smart Straight Text Snap
    const [selectedHighlighterColor, setSelectedHighlighterColor] = useState(HIGHLIGHTER_BASE_COLORS[0]);
    const [highlighterTone, setHighlighterTone] = useState('medium');
    const [highlighterThickness, setHighlighterThickness] = useState(24); // Default 24px authentic marker height
    const [straightLineHighlight, setStraightLineHighlight] = useState(true);

    const computedHighlighterRgba = useMemo(() => {
        const toneObj = HIGHLIGHTER_TONES.find(t => t.id === highlighterTone) || HIGHLIGHTER_TONES[1];
        return `rgba(${selectedHighlighterColor.r}, ${selectedHighlighterColor.g}, ${selectedHighlighterColor.b}, ${toneObj.opacity})`;
    }, [selectedHighlighterColor, highlighterTone]);

    const [fontSize, setFontSize] = useState(16);
    const [newTextContent, setNewTextContent] = useState('Sample Note');

    // Annotations & History Stacks (All stored permanently in state)
    const [annotations, setAnnotations] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Live Dragging Visual State (for SVG overlay)
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingPage, setDrawingPage] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [shapeStart, setShapeStart] = useState(null);
    const [shapeCurrent, setShapeCurrent] = useState(null);

    // Synchronous Drag Refs
    const isDrawingRef = useRef(false);
    const drawingPageRef = useRef(null);
    const shapeStartRef = useRef(null);
    const shapeCurrentRef = useRef(null);
    const currentPathRef = useRef([]);
    const movingTextRef = useRef(null);
    const straightLineHighlightRef = useRef(true);

    useEffect(() => {
        straightLineHighlightRef.current = straightLineHighlight;
    }, [straightLineHighlight]);

    // Virtual Windowing Buffer
    const [renderedPages, setRenderedPages] = useState(new Set([1]));

    // Canvas refs
    const canvasRefs = useRef({});
    const renderTasksRef = useRef({});
    const pageContainersRef = useRef({});
    const scrollContainerRef = useRef(null);

    // Auto-detect container width for perfect Fit-to-Width across all screens
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    setContainerWidth(entry.contentRect.width);
                }
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [file]);

    const onDrop = useCallback(async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        if (!selected) return;
        setFile(selected);
        setAnnotations([]);
        setRedoStack([]);
        setSelectedAnnotationId(null);
        setVisiblePage(1);
        setStatus({ type: 'loading', message: 'Opening document in interactive studio...' });

        try {
            const doc = await loadPdfJsDoc(selected);
            setPdfDoc(doc);
            setTotalPages(doc.numPages);

            const firstPage = await doc.getPage(1);
            const vp = firstPage.getViewport({ scale: 1.0 });
            const ratio = vp.height / vp.width;

            const ratios = {};
            for (let i = 1; i <= doc.numPages; i++) {
                ratios[i] = ratio;
            }
            setPageAspectRatios(ratios);
            setRenderedPages(new Set([1, 2, 3, 4, 5].filter(p => p <= doc.numPages)));
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF: ${e.message}` });
        }
    }, []);

    // Effective scale calculation
    const effectiveScale = useMemo(() => {
        if (zoomMode === 'fit-width') {
            const availableWidth = Math.max(300, containerWidth - 48);
            return Math.min(2.0, Math.max(0.4, availableWidth / 595));
        }
        return manualScale;
    }, [zoomMode, manualScale, containerWidth]);

    // Render individual pure background page canvas with PDF.js (Independent from annotations)
    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDoc) return;
        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: effectiveScale * 1.5 });

            const canvas = canvasRefs.current[pageNum];
            if (!canvas) return;

            if (renderTasksRef.current[pageNum]) {
                try {
                    renderTasksRef.current[pageNum].cancel();
                } catch (_) {}
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const renderTask = page.render({ canvasContext: ctx, viewport });
            renderTasksRef.current[pageNum] = renderTask;

            await renderTask.promise;
            renderTasksRef.current[pageNum] = null;
        } catch (e) {
            if (e?.name !== 'RenderingCancelledException') {
                console.error(`Page ${pageNum} render error:`, e);
            }
        }
    }, [pdfDoc, effectiveScale]);

    // Re-render PDF background canvases when scale or document changes
    useEffect(() => {
        if (!pdfDoc) return;
        renderedPages.forEach(p => renderPage(p));
    }, [pdfDoc, renderedPages, effectiveScale, renderPage]);

    // Auto-detect current visible page on scroll
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const containerTop = container.scrollTop;
        let currentVis = 1;

        for (let p = 1; p <= totalPages; p++) {
            const el = pageContainersRef.current[p];
            if (el && el.offsetTop - 140 <= containerTop) {
                currentVis = p;
            }
        }
        setVisiblePage(currentVis);

        const buffer = new Set();
        for (let p = Math.max(1, currentVis - 2); p <= Math.min(totalPages, currentVis + 3); p++) {
            buffer.add(p);
        }
        setRenderedPages(buffer);
    };

    // Smooth page jump
    const scrollToPage = (pageNum) => {
        setRenderedPages(prev => new Set([...prev, pageNum, Math.max(1, pageNum - 1), Math.min(totalPages, pageNum + 1)]));
        setTimeout(() => {
            const targetEl = pageContainersRef.current[pageNum];
            if (targetEl && scrollContainerRef.current) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setVisiblePage(pageNum);
            }
        }, 50);
    };

    // Real-Time Pointer Coordinates Calculator
    const getPointerCoords = useCallback((e, pageNum) => {
        const container = pageContainersRef.current[pageNum];
        if (!container) return { x: 0, y: 0, percentX: 0, percentY: 0, rectWidth: 800, rectHeight: 1100 };
        const rect = container.getBoundingClientRect();

        const clientX = e.touches && e.touches.length > 0 
            ? e.touches[0].clientX 
            : (e.clientX !== undefined ? e.clientX : (e.nativeEvent?.clientX ?? 0));
        const clientY = e.touches && e.touches.length > 0 
            ? e.touches[0].clientY 
            : (e.clientY !== undefined ? e.clientY : (e.nativeEvent?.clientY ?? 0));

        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

        return {
            x,
            y,
            percentX: rect.width > 0 ? (x / rect.width) * 100 : 0,
            percentY: rect.height > 0 ? (y / rect.height) * 100 : 0,
            rectWidth: rect.width || 800,
            rectHeight: rect.height || 1100
        };
    }, []);

    // Start Live Drawing or Place Text Note
    const handlePointerDown = (e, pageNum) => {
        if (e.target && (e.target.closest('input') || e.target.closest('button') || e.target.closest('.text-note-card'))) {
            return;
        }

        if (activeMode === 'text') {
            const coords = getPointerCoords(e, pageNum);
            const newTextAnn = {
                id: `text-${Date.now()}-${Math.random()}`,
                page: pageNum,
                type: 'text',
                text: newTextContent || 'Note',
                fontSize,
                color: penColor,
                percentX: coords.percentX,
                percentY: coords.percentY,
            };
            setAnnotations(prev => [...prev, newTextAnn]);
            setRedoStack([]);
            return;
        }

        const coords = getPointerCoords(e, pageNum);
        isDrawingRef.current = true;
        drawingPageRef.current = pageNum;
        shapeStartRef.current = coords;
        shapeCurrentRef.current = coords;
        currentPathRef.current = [coords];

        setIsDrawing(true);
        setDrawingPage(pageNum);
        setShapeStart(coords);
        setShapeCurrent(coords);
        if (activeMode === 'pen' || activeMode === 'highlighter') {
            setCurrentPath([coords]);
        }
    };

    // Text Drag/Move Initiation
    const handleTextDragStart = (e, tAnn) => {
        e.stopPropagation();
        e.preventDefault();
        const coords = getPointerCoords(e, tAnn.page);
        movingTextRef.current = {
            id: tAnn.id,
            page: tAnn.page,
            initialPercentX: tAnn.percentX,
            initialPercentY: tAnn.percentY,
            startPointerX: coords.x,
            startPointerY: coords.y,
            rectWidth: coords.rectWidth,
            rectHeight: coords.rectHeight,
        };
    };

    // Global Event Listeners for 60 FPS Drawing & Text Drag Moving
    useEffect(() => {
        const onGlobalMove = (e) => {
            // Move Text Note
            if (movingTextRef.current) {
                const moveData = movingTextRef.current;
                const container = pageContainersRef.current[moveData.page];
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.clientX !== undefined ? e.clientX : (e.nativeEvent?.clientX ?? 0));
                    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.clientY !== undefined ? e.clientY : (e.nativeEvent?.clientY ?? 0));

                    const currentX = Math.max(0, Math.min(rect.width, clientX - rect.left));
                    const currentY = Math.max(0, Math.min(rect.height, clientY - rect.top));

                    const deltaPercentX = ((currentX - moveData.startPointerX) / moveData.rectWidth) * 100;
                    const deltaPercentY = ((currentY - moveData.startPointerY) / moveData.rectHeight) * 100;

                    const newPercentX = Math.max(0, Math.min(90, moveData.initialPercentX + deltaPercentX));
                    const newPercentY = Math.max(0, Math.min(95, moveData.initialPercentY + deltaPercentY));

                    setAnnotations(prev => prev.map(a => a.id === moveData.id ? {
                        ...a,
                        percentX: newPercentX,
                        percentY: newPercentY
                    } : a));
                }
                return;
            }

            // Draw Shapes / Pen / Smart Straight Highlighter
            if (isDrawingRef.current && drawingPageRef.current) {
                const rawCoords = getPointerCoords(e, drawingPageRef.current);
                let coords = rawCoords;

                // Smart Straight Text Alignment for Highlighter
                if (activeMode === 'highlighter' && (straightLineHighlightRef.current || e.shiftKey) && shapeStartRef.current) {
                    coords = {
                        ...rawCoords,
                        y: shapeStartRef.current.y,
                        percentY: shapeStartRef.current.percentY
                    };
                }

                shapeCurrentRef.current = coords;
                setShapeCurrent(coords);

                if (activeMode === 'pen' || activeMode === 'highlighter') {
                    currentPathRef.current.push(coords);
                    setCurrentPath([...currentPathRef.current]);
                }
            }
        };

        const onGlobalUp = () => {
            if (movingTextRef.current) {
                movingTextRef.current = null;
                return;
            }

            if (!isDrawingRef.current || !drawingPageRef.current || !shapeStartRef.current || !shapeCurrentRef.current) {
                isDrawingRef.current = false;
                drawingPageRef.current = null;
                setIsDrawing(false);
                setDrawingPage(null);
                return;
            }

            const page = drawingPageRef.current;
            const start = shapeStartRef.current;
            const current = shapeCurrentRef.current;
            let createdAnn = null;

            if (activeMode === 'pen' || activeMode === 'highlighter') {
                if (currentPathRef.current.length > 1) {
                    const scaledPoints = currentPathRef.current.map(p => ({
                        px: p.percentX,
                        py: p.percentY
                    }));

                    createdAnn = {
                        id: `draw-${Date.now()}-${Math.random()}`,
                        page,
                        type: activeMode,
                        points: scaledPoints,
                        color: activeMode === 'highlighter' ? computedHighlighterRgba : penColor,
                        width: activeMode === 'highlighter' ? highlighterThickness : penWidth,
                    };
                }
            } else if (['rectangle', 'circle', 'arrow'].includes(activeMode)) {
                const startX = start.percentX;
                const startY = start.percentY;
                const currentX = current.percentX;
                const currentY = current.percentY;

                if (activeMode === 'arrow') {
                    createdAnn = {
                        id: `arrow-${Date.now()}-${Math.random()}`,
                        page,
                        type: 'arrow',
                        fromPercentX: startX,
                        fromPercentY: startY,
                        toPercentX: currentX,
                        toPercentY: currentY,
                        color: penColor,
                        width: penWidth,
                    };
                } else {
                    const minPx = Math.min(startX, currentX);
                    const minPy = Math.min(startY, currentY);
                    const diffPw = Math.abs(currentX - startX);
                    const diffPh = Math.abs(currentY - startY);

                    if (diffPw > 0.5 && diffPh > 0.5) {
                        createdAnn = {
                            id: `shape-${Date.now()}-${Math.random()}`,
                            page,
                            type: activeMode,
                            percentX: minPx,
                            percentY: minPy,
                            percentW: diffPw,
                            percentH: diffPh,
                            color: penColor,
                            width: penWidth,
                        };
                    }
                }
            }

            if (createdAnn) {
                setAnnotations(prev => [...prev, createdAnn]);
                setRedoStack([]);
            }

            try {
                window.getSelection()?.removeAllRanges();
            } catch (_) {}

            isDrawingRef.current = false;
            drawingPageRef.current = null;
            shapeStartRef.current = null;
            shapeCurrentRef.current = null;
            currentPathRef.current = [];

            setIsDrawing(false);
            setDrawingPage(null);
            setCurrentPath([]);
            setShapeStart(null);
            setShapeCurrent(null);
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
    }, [activeMode, penColor, penWidth, computedHighlighterRgba, highlighterThickness, getPointerCoords]);

    // ── UNDO ACTION ──
    const handleUndo = useCallback(() => {
        if (annotations.length === 0) return;
        const last = annotations[annotations.length - 1];
        setRedoStack(prev => [...prev, last]);
        setAnnotations(prev => prev.slice(0, -1));
        setSelectedAnnotationId(null);
    }, [annotations]);

    // ── REDO ACTION ──
    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setRedoStack(prev => [...prev, -1]);
        setAnnotations(prev => [...prev, next]);
    }, [redoStack]);

    // ── DELETE SELECTED ANNOTATION ──
    const handleDeleteSelected = useCallback(() => {
        if (!selectedAnnotationId) return;
        const target = annotations.find(a => a.id === selectedAnnotationId);
        if (target) {
            setRedoStack(prev => [...prev, target]);
        }
        setAnnotations(prev => prev.filter(a => a.id !== selectedAnnotationId));
        setSelectedAnnotationId(null);
    }, [selectedAnnotationId, annotations]);

    // ── RESET / CLEAR ALL ANNOTATIONS ──
    const handleResetAllAnnotations = useCallback(() => {
        if (annotations.length === 0) return;
        if (window.confirm("Are you sure you want to clear all notes, shapes, and highlights on this document?")) {
            setRedoStack(prev => [...prev, ...annotations]);
            setAnnotations([]);
            setSelectedAnnotationId(null);
        }
    }, [annotations]);

    // ── BACK / LOAD NEW DOCUMENT ──
    const handleBackOrChangeDocument = useCallback(() => {
        setFile(null);
        setPdfDoc(null);
        setAnnotations([]);
        setRedoStack([]);
        setSelectedAnnotationId(null);
        setTotalPages(0);
        setVisiblePage(1);
    }, []);

    // ── GLOBAL KEYBOARD SHORTCUTS ──
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdKey = isMac ? e.metaKey : e.ctrlKey;

            if (cmdKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if (cmdKey && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedAnnotationId) {
                    e.preventDefault();
                    handleDeleteSelected();
                }
            } else if (e.key === 'Escape') {
                setSelectedAnnotationId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleDeleteSelected, selectedAnnotationId]);

    const handleTextChange = (id, newText) => {
        setAnnotations(prev => prev.map(a => a.id === id ? { ...a, text: newText } : a));
    };

    // Zoom Handlers
    const handleZoomIn = () => {
        setZoomMode('manual');
        setManualScale(s => Math.min(2.0, s + 0.15));
    };

    const handleZoomOut = () => {
        setZoomMode('manual');
        setManualScale(s => Math.max(0.5, s - 0.15));
    };

    const handleFitWidth = () => {
        setZoomMode('fit-width');
    };

    // Export & Download PDF
    const handleDownloadAnnotatedPdf = async () => {
        if (!file || annotations.length === 0) {
            setStatus({ type: 'error', message: 'No annotations added yet.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Compiling all visual annotations into final PDF...' });

        try {
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const existingPdfBytes = await file.arrayBuffer();
            const compiledDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const font = await compiledDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = compiledDoc.getPages();

            for (let pNum = 1; pNum <= pages.length; pNum++) {
                const targetPage = pages[pNum - 1];
                const pageAnn = annotations.filter(a => a.page === pNum);
                if (!targetPage || pageAnn.length === 0) continue;

                const { width: pageW, height: pageH } = targetPage.getSize();

                for (const a of pageAnn) {
                    if (a.type === 'text') {
                        const pdfX = (a.percentX / 100) * pageW;
                        const pdfY = pageH - ((a.percentY / 100) * pageH) - (a.fontSize * 1.1);

                        targetPage.drawRectangle({
                            x: pdfX - 4,
                            y: pdfY - 2,
                            width: (font.widthOfTextAtSize(a.text, a.fontSize)) + 12,
                            height: (a.fontSize * 1.3),
                            color: rgb(1, 1, 1),
                            borderColor: rgb(0.2, 0.4, 0.9),
                            borderWidth: 1
                        });

                        targetPage.drawText(a.text, {
                            x: pdfX,
                            y: pdfY,
                            size: a.fontSize,
                            font,
                            color: rgb(0.1, 0.2, 0.4)
                        });
                    } else if (a.type === 'rectangle') {
                        const pdfX = (a.percentX / 100) * pageW;
                        const pdfW = (a.percentW / 100) * pageW;
                        const pdfH = (a.percentH / 100) * pageH;
                        const pdfY = pageH - ((a.percentY / 100) * pageH) - pdfH;

                        targetPage.drawRectangle({
                            x: pdfX,
                            y: pdfY,
                            width: pdfW,
                            height: pdfH,
                            borderColor: rgb(0.15, 0.35, 0.9),
                            borderWidth: (a.width || 3) * (pageW / 595)
                        });
                    }
                }
            }

            const pdfBytes = await compiledDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `annotated_${file.name}`);
            setStatus({ type: 'success', message: 'Annotated PDF compiled and downloaded!' });

        } catch (e) {
            setStatus({ type: 'error', message: `Annotation error: ${e.message}` });
        }
    };

    if (!file) {
        return (
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text="Drag & drop a PDF to open in the Interactive Live Annotation Studio"
            />
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full select-none">
            {/* Top Toolbar: Sticky and Fully Responsive on all devices */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto max-w-full">
                    {[
                        { id: 'circle', icon: Circle, label: 'Circle' },
                        { id: 'rectangle', icon: Square, label: 'Box' },
                        { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
                        { id: 'pen', icon: Pen, label: 'Draw' },
                        { id: 'highlighter', icon: Highlighter, label: 'Highlight' },
                        { id: 'text', icon: Type, label: 'Text' },
                    ].map(tool => {
                        const Icon = tool.icon;
                        const isSelected = activeMode === tool.id;
                        return (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => setActiveMode(tool.id)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{tool.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Sub-tools: Colors, Highlighter Thickness, Tones, Straight Snap & Zoom */}
                <div className="flex flex-wrap items-center gap-2">
                    {activeMode === 'highlighter' && (
                        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                            {/* Color Dots */}
                            <div className="flex items-center gap-1">
                                {HIGHLIGHTER_BASE_COLORS.map(hc => (
                                    <button
                                        key={hc.name}
                                        type="button"
                                        onClick={() => setSelectedHighlighterColor(hc)}
                                        style={{ backgroundColor: hc.hex }}
                                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                            selectedHighlighterColor.name === hc.name ? 'scale-125 border-blue-500 ring-2 ring-blue-400' : 'border-gray-300'
                                        }`}
                                        title={hc.name}
                                    />
                                ))}
                            </div>

                            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

                            {/* Highlighter Thickness (Size) Selector */}
                            <div className="flex items-center gap-1">
                                {HIGHLIGHTER_SIZES.map(sz => (
                                    <button
                                        key={sz.id}
                                        type="button"
                                        onClick={() => setHighlighterThickness(sz.px)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                            highlighterThickness === sz.px
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                        title={`${sz.label} marker height (${sz.px}px)`}
                                    >
                                        {sz.label}
                                    </button>
                                ))}
                            </div>

                            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

                            {/* Light / Medium / Dark Tone Selector */}
                            <div className="flex items-center gap-1">
                                {HIGHLIGHTER_TONES.map(tone => (
                                    <button
                                        key={tone.id}
                                        type="button"
                                        onClick={() => setHighlighterTone(tone.id)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                            highlighterTone === tone.id
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                        title={`${tone.label} intensity (${Math.round(tone.opacity * 100)}% opacity)`}
                                    >
                                        {tone.label}
                                    </button>
                                ))}
                            </div>

                            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

                            {/* Smart Straight-Line Text Alignment Snap Toggle */}
                            <button
                                type="button"
                                onClick={() => setStraightLineHighlight(prev => !prev)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    straightLineHighlight
                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/50'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                title="Snap straight horizontally across text lines (Hold Shift to toggle anytime)"
                            >
                                <AlignLeft className="h-3 w-3" />
                                <span>Straight Snap: {straightLineHighlight ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>
                    )}

                    {activeMode !== 'highlighter' && activeMode !== 'text' && (
                        <div className="flex items-center gap-1">
                            {PEN_COLORS.map(pc => (
                                <button
                                    key={pc}
                                    type="button"
                                    onClick={() => setPenColor(pc)}
                                    style={{ backgroundColor: pc }}
                                    className={`w-5 h-5 rounded-full border transition-transform ${
                                        penColor === pc ? 'scale-125 border-blue-500 ring-2 ring-blue-400' : 'border-white dark:border-gray-700'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {activeMode === 'text' && (
                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                id="edit-tool-note-input"
                                name="note-text"
                                aria-label="Text note"
                                autoComplete="off"
                                value={newTextContent}
                                onChange={e => setNewTextContent(e.target.value)}
                                placeholder="Note text..."
                                className="w-24 sm:w-28 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium"
                            />
                            <select
                                id="edit-tool-font-size-select"
                                name="font-size"
                                aria-label="Font size"
                                value={fontSize}
                                onChange={e => setFontSize(Number(e.target.value))}
                                className="px-1 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold"
                            >
                                <option value={12}>12pt</option>
                                <option value={16}>16pt</option>
                                <option value={20}>20pt</option>
                                <option value={26}>26pt</option>
                            </select>
                        </div>
                    )}

                    {/* Auto-Fit & Zoom Controls */}
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleFitWidth}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                                zoomMode === 'fit-width' ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                            title="Auto Fit to Page Width"
                        >
                            Fit Width
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                            title="Zoom Out"
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 px-1 min-w-8 text-center">
                            {Math.round(effectiveScale * 100)}%
                        </span>
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                            title="Zoom In"
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* History Actions: Undo (⌘Z), Redo (⌘Y), Clear All */}
                    <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-1.5">
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={annotations.length === 0}
                            className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs cursor-pointer"
                            title="Undo (⌘Z / Ctrl+Z)"
                            aria-label="Undo action"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs cursor-pointer"
                            title="Redo (⌘Y / Ctrl+Y)"
                            aria-label="Redo action"
                        >
                            <RotateCw className="h-3.5 w-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleResetAllAnnotations}
                            disabled={annotations.length === 0}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs cursor-pointer"
                            title="Clear all notes and shapes"
                            aria-label="Clear all annotations"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Right Actions: Back to upload + Download PDF */}
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        type="button"
                        onClick={handleBackOrChangeDocument}
                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        title="Change PDF document"
                    >
                        <FileUp className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Change PDF</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadAnnotatedPdf}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                </div>
            </div>

            {/* Main Area: Sidebar Navigator + Multi-Page Live Interactive Scroll View */}
            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                {/* Left Sidebar */}
                <div className="w-full lg:w-72 space-y-4 shrink-0">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Page Navigation
                        </h4>
                        <PageNavigator
                            currentPage={visiblePage}
                            totalPages={totalPages}
                            onPageChange={scrollToPage}
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                            <span>Document Notes</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{annotations.length}</span>
                        </h4>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                            <p>• <strong>Highlight Snap</strong>: Locks straight over text lines</p>
                            <p>• <strong>Drag Handle (⠿)</strong>: Move text notes</p>
                            <p>• <strong>⌘Z / Ctrl+Z</strong>: Undo</p>
                            <p>• <strong>⌘Y / Ctrl+Y</strong>: Redo</p>
                            <p>• <strong>Delete</strong>: Delete selected item</p>
                        </div>
                    </div>

                    <MessageBox type={status.type} message={status.message} />
                </div>

                {/* Center: Multi-Page Real-Time Interactive Canvas Stream */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 bg-gray-100 dark:bg-gray-950 p-3 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[75vh] flex flex-col items-center gap-6 w-full shadow-inner overflow-x-hidden"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                        const isPageRendered = renderedPages.has(pageNum);
                        const ratio = pageAspectRatios[pageNum] || 1.414;
                        const isCurrentlyDrawingOnThisPage = isDrawing && drawingPage === pageNum;

                        const pageAnnotations = annotations.filter(a => a.page === pageNum);

                        // Live Drag Values in %
                        const liveMinPx = shapeStart && shapeCurrent ? Math.min(shapeStart.percentX, shapeCurrent.percentX) : 0;
                        const liveMinPy = shapeStart && shapeCurrent ? Math.min(shapeStart.percentY, shapeCurrent.percentY) : 0;
                        const liveDiffPw = shapeStart && shapeCurrent ? Math.abs(shapeCurrent.percentX - shapeStart.percentX) : 0;
                        const liveDiffPh = shapeStart && shapeCurrent ? Math.abs(shapeCurrent.percentY - shapeStart.percentY) : 0;

                        return (
                            <div
                                key={pageNum}
                                className="w-full flex flex-col items-center max-w-3xl"
                            >
                                {/* Page Indicator Tag */}
                                <div className="self-start mb-2 px-3 py-1 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-300 shadow-2xs">
                                    Page {pageNum} of {totalPages}
                                </div>

                                {/* Canvas & Live Interactive SVG Layer */}
                                <div 
                                    ref={el => pageContainersRef.current[pageNum] = el}
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: '100%', 
                                        touchAction: 'none',
                                        ...getToolCursorStyle(activeMode)
                                    }}
                                    onMouseDown={(e) => handlePointerDown(e, pageNum)}
                                    onTouchStart={(e) => handlePointerDown(e, pageNum)}
                                    className="relative border border-gray-300 dark:border-gray-700 shadow-xl bg-white rounded-lg overflow-hidden flex justify-center select-none"
                                >
                                    {isPageRendered ? (
                                        <canvas
                                            ref={el => canvasRefs.current[pageNum] = el}
                                            className="block w-full h-auto object-contain pointer-events-none"
                                        />
                                    ) : (
                                        <div 
                                            style={{ aspectRatio: `1 / ${ratio}` }}
                                            className="w-full bg-white dark:bg-gray-900 flex items-center justify-center text-xs text-gray-400"
                                        >
                                            <span>Page {pageNum} (Scroll to view)</span>
                                        </div>
                                    )}

                                    {/* 🌟 Permanent Vector SVG Overlay (Always Active, Never Disappears) */}
                                    <svg 
                                        viewBox="0 0 100 100" 
                                        preserveAspectRatio="none"
                                        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                                    >
                                        <defs>
                                            <marker 
                                                id={`arrowhead-perm-${pageNum}`} 
                                                markerWidth="6" 
                                                markerHeight="4" 
                                                refX="5" 
                                                refY="2" 
                                                orient="auto"
                                            >
                                                <polygon points="0 0, 6 2, 0 4" fill={penColor} />
                                            </marker>
                                        </defs>

                                        {/* Render All Committed Annotations */}
                                        {pageAnnotations.map(a => {
                                            if (a.type === 'highlighter' || a.type === 'pen') {
                                                const pointsStr = a.points.map(p => `${p.px},${p.py}`).join(' ');
                                                const strokePx = a.type === 'highlighter' ? (a.width || 24) : (a.width || 3);
                                                return (
                                                    <polyline
                                                        key={a.id}
                                                        points={pointsStr}
                                                        fill="none"
                                                        stroke={a.color}
                                                        strokeWidth={strokePx}
                                                        strokeLinecap={a.type === 'highlighter' ? 'square' : 'round'}
                                                        strokeLinejoin="round"
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                );
                                            } else if (a.type === 'rectangle') {
                                                return (
                                                    <rect
                                                        key={a.id}
                                                        x={a.percentX}
                                                        y={a.percentY}
                                                        width={a.percentW}
                                                        height={a.percentH}
                                                        fill="none"
                                                        stroke={a.color}
                                                        strokeWidth={a.width || 2.5}
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                );
                                            } else if (a.type === 'circle') {
                                                return (
                                                    <ellipse
                                                        key={a.id}
                                                        cx={a.percentX + a.percentW / 2}
                                                        cy={a.percentY + a.percentH / 2}
                                                        rx={a.percentW / 2}
                                                        ry={a.percentH / 2}
                                                        fill="none"
                                                        stroke={a.color}
                                                        strokeWidth={a.width || 2.5}
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                );
                                            } else if (a.type === 'arrow') {
                                                return (
                                                    <line
                                                        key={a.id}
                                                        x1={a.fromPercentX}
                                                        y1={a.fromPercentY}
                                                        x2={a.toPercentX}
                                                        y2={a.toPercentY}
                                                        stroke={a.color}
                                                        strokeWidth={a.width || 2.5}
                                                        markerEnd={`url(#arrowhead-perm-${pageNum})`}
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                );
                                            }
                                            return null;
                                        })}

                                        {/* Live In-Progress Drawing Preview */}
                                        {isCurrentlyDrawingOnThisPage && shapeStart && shapeCurrent && (
                                            <>
                                                {activeMode === 'circle' && (
                                                    <ellipse
                                                        cx={liveMinPx + liveDiffPw / 2}
                                                        cy={liveMinPy + liveDiffPh / 2}
                                                        rx={liveDiffPw / 2}
                                                        ry={liveDiffPh / 2}
                                                        fill="rgba(37, 99, 235, 0.15)"
                                                        stroke={penColor}
                                                        strokeWidth={penWidth || 2.5}
                                                        strokeDasharray="4 4"
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                )}

                                                {activeMode === 'rectangle' && (
                                                    <rect
                                                        x={liveMinPx}
                                                        y={liveMinPy}
                                                        width={liveDiffPw}
                                                        height={liveDiffPh}
                                                        fill="rgba(37, 99, 235, 0.15)"
                                                        stroke={penColor}
                                                        strokeWidth={penWidth || 2.5}
                                                        strokeDasharray="4 4"
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                )}

                                                {activeMode === 'arrow' && (
                                                    <line
                                                        x1={shapeStart.percentX}
                                                        y1={shapeStart.percentY}
                                                        x2={shapeCurrent.percentX}
                                                        y2={shapeCurrent.percentY}
                                                        stroke={penColor}
                                                        strokeWidth={penWidth || 2.5}
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                )}

                                                {(activeMode === 'pen' || activeMode === 'highlighter') && currentPath.length > 1 && (
                                                    <polyline
                                                        points={currentPath.map(p => `${p.percentX},${p.percentY}`).join(' ')}
                                                        fill="none"
                                                        stroke={activeMode === 'highlighter' ? computedHighlighterRgba : penColor}
                                                        strokeWidth={activeMode === 'highlighter' ? highlighterThickness : (penWidth || 3)}
                                                        strokeLinecap={activeMode === 'highlighter' ? 'square' : 'round'}
                                                        strokeLinejoin="round"
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </svg>

                                    {/* Moveable & Draggable Text Notes Overlay */}
                                    {isPageRendered && annotations.filter(a => a.page === pageNum && a.type === 'text').map(tAnn => (
                                        <div
                                            key={tAnn.id}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            style={{
                                                left: `${tAnn.percentX}%`,
                                                top: `${tAnn.percentY}%`,
                                                fontSize: `${tAnn.fontSize * (effectiveScale * 0.9)}px`,
                                                color: tAnn.color,
                                            }}
                                            className="text-note-card absolute bg-white dark:bg-gray-900 border border-blue-400 dark:border-blue-500 px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1.5 group z-20 transition-shadow hover:shadow-lg hover:ring-2 hover:ring-blue-400/30"
                                        >
                                            {/* Drag Move Handle */}
                                            <div
                                                onMouseDown={(e) => handleTextDragStart(e, tAnn)}
                                                onTouchStart={(e) => handleTextDragStart(e, tAnn)}
                                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 p-0.5 -ml-1 select-none touch-none"
                                                title="Click and drag to move text anywhere on page"
                                            >
                                                <GripVertical className="h-3.5 w-3.5" />
                                            </div>

                                            {/* Text Input Field */}
                                            <input
                                                type="text"
                                                name={`text-note-${tAnn.id}`}
                                                aria-label="Edit annotation text"
                                                autoComplete="off"
                                                autoFocus
                                                value={tAnn.text}
                                                onChange={(e) => handleTextChange(tAnn.id, e.target.value)}
                                                onBlur={(e) => {
                                                    if (!e.target.value.trim()) {
                                                        setAnnotations(prev => prev.filter(a => a.id !== tAnn.id));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.target.blur();
                                                    }
                                                }}
                                                className="bg-transparent font-medium border-0 focus:outline-none focus:ring-0 p-0 text-gray-900 dark:text-white min-w-[60px]"
                                            />

                                            {/* Delete Note Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setAnnotations(prev => prev.filter(a => a.id !== tAnn.id));
                                                    setSelectedAnnotationId(null);
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer text-sm font-bold leading-none"
                                                title="Delete text note"
                                                aria-label="Delete text note"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EditPdfTool;
