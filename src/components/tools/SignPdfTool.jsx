import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import { 
    PenTool, 
    Type, 
    Calendar, 
    Image as ImageIcon, 
    CheckCircle, 
    RotateCcw, 
    X, 
    ShieldAlert, 
    Stamp, 
    Trash2, 
    Check,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Move
} from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import PageNavigator from '../common/PageNavigator.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

const SIGNATURE_FONTS = [
    { id: 'great-vibes', name: 'Great Vibes (Classic Calligraphy)', font: '"Great Vibes", cursive', size: 48 },
    { id: 'alex-brush', name: 'Alex Brush (Fine Script)', font: '"Alex Brush", cursive', size: 48 },
    { id: 'caveat', name: 'Caveat (Natural Handwritten)', font: '"Caveat", cursive', size: 44 },
    { id: 'dancing-script', name: 'Dancing Script (Fluid Cursive)', font: '"Dancing Script", cursive', size: 42 },
    { id: 'sacramento', name: 'Sacramento (Monoline Signature)', font: '"Sacramento", cursive', size: 46 },
    { id: 'satisfy', name: 'Satisfy (Bold Signature Brush)', font: '"Satisfy", cursive', size: 40 },
];

/**
 * Signature Creation Modal supporting Drawing, Typing (Authentic Cursive Scripts), and File Upload
 */
const CreateSignatureModal = ({ isOpen, onClose, onSaveSignature }) => {
    const [tab, setTab] = useState('type'); // 'type', 'draw', 'upload'
    
    // Ink Colors: Midnight Navy Blue, Jet Black, Deep Crimson, Emerald Ink
    const [strokeColor, setStrokeColor] = useState('#1e3a8a');

    // Draw Tab State
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lineWidth, setLineWidth] = useState(3);

    // Type Cursive Tab State
    const [typedName, setTypedName] = useState('Yash Dhanani');
    const [selectedFontId, setSelectedFontId] = useState('great-vibes');

    // Upload Tab State
    const [uploadedImgUrl, setUploadedImgUrl] = useState(null);

    // Canvas drawing handlers
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    if (!isOpen) return null;

    const generateTypedSignatureDataUrl = () => {
        const selectedFont = SIGNATURE_FONTS.find(f => f.id === selectedFontId) || SIGNATURE_FONTS[0];
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.font = `${selectedFont.size}px ${selectedFont.font.replace(/"/g, '')}`;
        ctx.fillStyle = strokeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || 'Signature', canvas.width / 2, canvas.height / 2);
        return canvas.toDataURL('image/png');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImgUrl(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        let finalDataUrl = null;
        if (tab === 'draw') {
            finalDataUrl = canvasRef.current.toDataURL('image/png');
        } else if (tab === 'type') {
            finalDataUrl = generateTypedSignatureDataUrl();
        } else if (tab === 'upload') {
            finalDataUrl = uploadedImgUrl;
        }

        if (finalDataUrl) {
            onSaveSignature(finalDataUrl);
            clearCanvas();
            setUploadedImgUrl(null);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <PenTool className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Create Signature & Stamp
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl my-4">
                    <button
                        onClick={() => setTab('type')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            tab === 'type' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Type className="h-3.5 w-3.5" /> Type Cursive
                    </button>
                    <button
                        onClick={() => setTab('draw')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            tab === 'draw' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <PenTool className="h-3.5 w-3.5" /> Draw Freehand
                    </button>
                    <button
                        onClick={() => setTab('upload')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            tab === 'upload' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <ImageIcon className="h-3.5 w-3.5" /> Upload Image
                    </button>
                </div>

                {/* Color Chooser */}
                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Signature Ink Color:</span>
                    <div className="flex gap-2">
                        {[
                            { name: 'Navy', hex: '#1e3a8a' },
                            { name: 'Black', hex: '#0f172a' },
                            { name: 'Crimson', hex: '#991b1b' },
                            { name: 'Emerald', hex: '#065f46' },
                        ].map(c => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => setStrokeColor(c.hex)}
                                style={{ backgroundColor: c.hex }}
                                className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
                                    strokeColor === c.hex ? 'scale-125 border-blue-500 ring-2 ring-blue-400' : 'border-white dark:border-gray-700'
                                }`}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Tab 1: Type Cursive */}
                {tab === 'type' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Enter Your Name
                            </label>
                            <input
                                type="text"
                                value={typedName}
                                onChange={e => setTypedName(e.target.value)}
                                placeholder="Type your name..."
                                className="block w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Choose Calligraphic Signature Style
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                                {SIGNATURE_FONTS.map(fontItem => {
                                    const isSelected = selectedFontId === fontItem.id;
                                    return (
                                        <button
                                            key={fontItem.id}
                                            type="button"
                                            onClick={() => setSelectedFontId(fontItem.id)}
                                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-center cursor-pointer min-h-[96px] ${
                                                isSelected
                                                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 ring-2 ring-blue-500/20 shadow-xs'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1 w-full">
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                    {fontItem.name.split(' (')[0]}
                                                </span>
                                                {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                                            </div>
                                            <div 
                                                style={{ 
                                                    fontFamily: fontItem.font,
                                                    color: strokeColor,
                                                    fontSize: `${fontItem.size * 0.85}px`
                                                }}
                                                className="w-full flex-1 flex items-center justify-center text-center py-2 select-none"
                                            >
                                                {typedName || 'Your Signature'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Draw Freehand */}
                {tab === 'draw' && (
                    <div className="space-y-3">
                        <canvas
                            ref={canvasRef}
                            width={540}
                            height={180}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white w-full h-[180px] touch-none cursor-crosshair"
                        />
                        <div className="flex justify-between items-center text-xs">
                            <button
                                type="button"
                                onClick={clearCanvas}
                                className="text-gray-500 hover:text-red-500 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Clear Canvas
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Thickness:</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="6"
                                    value={lineWidth}
                                    onChange={(e) => setLineWidth(Number(e.target.value))}
                                    className="w-24 accent-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Upload Image */}
                {tab === 'upload' && (
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            onChange={handleFileUpload}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadedImgUrl && (
                            <div className="p-4 border rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                <img src={uploadedImgUrl} alt="Signature Preview" className="max-h-28 object-contain" />
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                    >
                        Use Signature
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * World-Class Sign & Stamp Studio with Drag-and-Drop, Corner Resizing,
 * Direct Jump Page Navigator, and Authentic Google Cursive Signatures.
 */
export const SignPdfTool = () => {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [placements, setPlacements] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Active Drag/Move and Active Resize Refs
    const activeDragRef = useRef(null);
    const activeResizeRef = useRef(null);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const renderTaskRef = useRef(null);

    const renderPdfPage = useCallback(async (selectedFile, pageNum) => {
        try {
            const doc = await loadPdfJsDoc(selectedFile);
            setNumPages(doc.numPages);
            const page = await doc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.25 });

            const canvas = canvasRef.current;
            if (!canvas) return;

            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch (_) {}
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const renderTask = page.render({ canvasContext: ctx, viewport });
            renderTaskRef.current = renderTask;

            await renderTask.promise;
            renderTaskRef.current = null;
        } catch (e) {
            if (e?.name !== 'RenderingCancelledException') {
                console.error("Render error:", e);
            }
        }
    }, []);

    const onFileChange = useCallback((acceptedFiles) => {
        const selected = acceptedFiles[0];
        if (selected) {
            setFile(selected);
            setPlacements([]);
            setSelectedFieldId(null);
            setCurrentPage(1);
            setStatus({ type: '', message: '' });
            renderPdfPage(selected, 1);
        }
    }, [renderPdfPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        renderPdfPage(file, newPage);
    };

    const addBadgeStamp = (label, color = 'blue') => {
        const newId = `badge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        setPlacements(prev => [
            ...prev,
            {
                id: newId,
                kind: 'badge',
                value: label,
                color,
                page: currentPage,
                x: 40,
                y: 40,
                width: 140,
                height: 36
            }
        ]);
        setSelectedFieldId(newId);
    };

    const handleSaveSignatureStamp = (dataUrl) => {
        const newId = `sig-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        setPlacements(prev => [
            ...prev,
            {
                id: newId,
                kind: 'image',
                value: dataUrl,
                page: currentPage,
                x: 40,
                y: 40,
                width: 200,
                height: 80
            }
        ]);
        setSelectedFieldId(newId);
    };

    // --- Drag and Drop Movement Handler ---
    const handleMouseDownOnField = (e, field) => {
        e.stopPropagation();
        setSelectedFieldId(field.id);
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
        activeDragRef.current = {
            id: field.id,
            startPointerX: clientX,
            startPointerY: clientY,
            startX: field.x,
            startY: field.y,
        };
    };

    // --- Corner Resize Handlers ---
    const handleResizeStart = (e, field, corner) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedFieldId(field.id);
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
        activeResizeRef.current = {
            id: field.id,
            corner,
            startPointerX: clientX,
            startPointerY: clientY,
            startW: field.width,
            startH: field.height,
            startX: field.x,
            startY: field.y,
            aspectRatio: field.width / field.height,
        };
    };

    // Global Event Listeners for 60 FPS Moving & Resizing
    useEffect(() => {
        const onGlobalMove = (e) => {
            const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.clientX ?? 0);
            const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.clientY ?? 0);

            // Handle Resizing
            if (activeResizeRef.current) {
                const { id, corner, startPointerX, startPointerY, startW, startH, startX, startY, aspectRatio } = activeResizeRef.current;
                const deltaX = clientX - startPointerX;

                let newW = startW;
                let newH = startH;
                let newX = startX;
                let newY = startY;

                if (corner === 'se') {
                    newW = Math.max(50, Math.min(600, startW + deltaX));
                    newH = Math.round(newW / aspectRatio);
                } else if (corner === 'sw') {
                    newW = Math.max(50, Math.min(600, startW - deltaX));
                    newH = Math.round(newW / aspectRatio);
                    newX = startX + (startW - newW);
                } else if (corner === 'ne') {
                    newW = Math.max(50, Math.min(600, startW + deltaX));
                    newH = Math.round(newW / aspectRatio);
                    newY = startY + (startH - newH);
                } else if (corner === 'nw') {
                    newW = Math.max(50, Math.min(600, startW - deltaX));
                    newH = Math.round(newW / aspectRatio);
                    newX = startX + (startW - newW);
                    newY = startY + (startH - newH);
                }

                setPlacements(prev => prev.map(p => p.id === id ? { ...p, width: newW, height: newH, x: newX, y: newY } : p));
                return;
            }

            // Handle Moving
            if (activeDragRef.current) {
                const { id, startPointerX, startPointerY, startX, startY } = activeDragRef.current;
                const deltaX = clientX - startPointerX;
                const deltaY = clientY - startPointerY;

                const newX = Math.max(0, startX + deltaX);
                const newY = Math.max(0, startY + deltaY);

                setPlacements(prev => prev.map(p => p.id === id ? { ...p, x: newX, y: newY } : p));
            }
        };

        const onGlobalUp = () => {
            activeDragRef.current = null;
            activeResizeRef.current = null;
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
    }, []);

    const deleteField = (id) => {
        setPlacements(prev => prev.filter(p => p.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    // Quick Resize Steps (+ / - 15%)
    const handleScaleField = (id, factor) => {
        setPlacements(prev => prev.map(p => {
            if (p.id === id) {
                const newW = Math.max(50, Math.min(600, Math.round(p.width * factor)));
                const ratio = p.width / p.height;
                const newH = Math.round(newW / ratio);
                return { ...p, width: newW, height: newH };
            }
            return p;
        }));
    };

    const selectedField = useMemo(() => {
        return placements.find(p => p.id === selectedFieldId);
    }, [placements, selectedFieldId]);

    const handleFinalize = async () => {
        if (!file || placements.length === 0) {
            setStatus({ type: 'error', message: 'Please place at least one signature or stamp before saving.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Burning signatures & stamps into PDF document...' });

        try {
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
                const targetPage = pages[pageNum - 1];
                const pagePlacements = placements.filter(p => p.page === pageNum);
                if (!targetPage || pagePlacements.length === 0) continue;

                const { width: pageW, height: pageH } = targetPage.getSize();
                const canvasW = canvasRef.current?.width || pageW;
                const canvasH = canvasRef.current?.height || pageH;

                const scaleX = pageW / canvasW;
                const scaleY = pageH / canvasH;

                for (const p of pagePlacements) {
                    const finalX = p.x * scaleX;
                    const finalW = p.width * scaleX;
                    const finalH = p.height * scaleY;
                    const finalY = pageH - (p.y * scaleY) - finalH;

                    if (p.kind === 'image') {
                        const imgBytes = await fetch(p.value).then(res => res.arrayBuffer());
                        let embeddedImg;
                        try {
                            embeddedImg = await pdfDoc.embedPng(imgBytes);
                        } catch {
                            embeddedImg = await pdfDoc.embedJpg(imgBytes);
                        }
                        targetPage.drawImage(embeddedImg, {
                            x: finalX,
                            y: finalY,
                            width: finalW,
                            height: finalH
                        });
                    } else if (p.kind === 'badge') {
                        const isRed = p.color === 'red';
                        targetPage.drawRectangle({
                            x: finalX,
                            y: finalY,
                            width: finalW,
                            height: finalH,
                            color: isRed ? rgb(1, 0.95, 0.95) : rgb(0.95, 0.97, 1),
                            borderColor: isRed ? rgb(0.85, 0.2, 0.2) : rgb(0.2, 0.4, 0.9),
                            borderWidth: 1.5,
                        });

                        const fontSize = Math.max(9, Math.min(14, finalH * 0.4));
                        const textW = font.widthOfTextAtSize(p.value, fontSize);
                        targetPage.drawText(p.value, {
                            x: finalX + (finalW - textW) / 2,
                            y: finalY + (finalH - fontSize) / 2 + 2,
                            size: fontSize,
                            font,
                            color: isRed ? rgb(0.7, 0.1, 0.1) : rgb(0.1, 0.3, 0.7)
                        });
                    }
                }
            }

            const updatedPdfBytes = await pdfDoc.save();
            saveAs(new Blob([updatedPdfBytes], { type: 'application/pdf' }), `signed_${file.name}`);
            setStatus({ type: 'success', message: 'PDF successfully signed and ready for download!' });
        } catch (e) {
            setStatus({ type: 'error', message: `Sign error: ${e.message}` });
        }
    };

    if (!file) {
        return (
            <FileUploader
                onFilesAccepted={onFileChange}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text="Drag & drop a PDF document to sign or stamp"
            />
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full select-none">
            <CreateSignatureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveSignature={handleSaveSignatureStamp}
            />

            {/* Left Controls Sidebar */}
            <div className="w-full lg:w-80 bg-gray-50 dark:bg-gray-800/90 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-2xs shrink-0">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            <Stamp className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Signature & Stamp Studio
                        </h3>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white font-semibold cursor-pointer"
                        >
                            Change PDF
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                        <PenTool className="h-4 w-4" /> + Create Signature Stamp
                    </button>

                    {/* Selected Signature Size Slider */}
                    {selectedField && (
                        <div className="p-3 bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                                <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> Size Scale</span>
                                <span>{Math.round(selectedField.width)}px</span>
                            </div>
                            <input
                                type="range"
                                min={60}
                                max={450}
                                value={selectedField.width}
                                onChange={(e) => {
                                    const newW = parseInt(e.target.value, 10);
                                    const ratio = selectedField.width / selectedField.height;
                                    const newH = Math.round(newW / ratio);
                                    setPlacements(prev => prev.map(p => p.id === selectedField.id ? { ...p, width: newW, height: newH } : p));
                                }}
                                className="w-full h-1.5 bg-blue-200 dark:bg-blue-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between items-center text-[10px] text-blue-700 dark:text-blue-300">
                                <button type="button" onClick={() => handleScaleField(selectedField.id, 0.85)} className="hover:underline font-bold">- Shrink</button>
                                <button type="button" onClick={() => handleScaleField(selectedField.id, 1.15)} className="hover:underline font-bold">+ Enlarge</button>
                            </div>
                        </div>
                    )}

                    {/* Quick Badges */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                            Quick Badges
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => addBadgeStamp(new Date().toISOString().split('T')[0], 'blue')}
                                className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Date Badge
                            </button>
                            <button
                                onClick={() => addBadgeStamp('APPROVED', 'green')}
                                className="p-2 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg text-xs font-bold text-green-800 dark:text-green-300 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                                <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> Approved
                            </button>
                            <button
                                onClick={() => addBadgeStamp('CONFIDENTIAL', 'red')}
                                className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold text-red-800 dark:text-red-300 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                                <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /> Confidential
                            </button>
                            <button
                                onClick={() => addBadgeStamp('INITIALS: JD', 'blue')}
                                className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                                Initials
                            </button>
                        </div>
                    </div>

                    {/* Direct Page Jump Navigator Component */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <PageNavigator
                            currentPage={currentPage}
                            totalPages={numPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <MessageBox type={status.type} message={status.message} />
                    <button
                        onClick={handleFinalize}
                        disabled={placements.length === 0 || status.type === 'loading'}
                        className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {status.type === 'loading' ? 'Applying Stamps...' : `Apply & Download PDF (${placements.length})`}
                    </button>
                </div>
            </div>

            {/* Live Interactive Canvas Workspace */}
            <div 
                ref={containerRef}
                onClick={() => setSelectedFieldId(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-auto min-h-[500px] flex flex-col items-center justify-center shadow-inner"
            >
                <div className="self-start mb-2 px-3 py-1 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-300 shadow-2xs">
                    Page {currentPage} of {numPages} • Drag corners to resize
                </div>

                <div className="relative border border-gray-300 dark:border-gray-700 shadow-xl bg-white rounded-lg overflow-visible select-none max-w-full">
                    <canvas ref={canvasRef} className="block max-w-full h-auto object-contain" />

                    {/* Draggable & Corner-Resizeable Placements */}
                    {placements.filter(p => p.page === currentPage).map(field => {
                        const isSelected = selectedFieldId === field.id;
                        return (
                            <div
                                key={field.id}
                                style={{
                                    transform: `translate(${field.x}px, ${field.y}px)`,
                                    width: field.width,
                                    height: field.height,
                                }}
                                onMouseDown={(e) => handleMouseDownOnField(e, field)}
                                onTouchStart={(e) => handleMouseDownOnField(e, field)}
                                onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); }}
                                className={`absolute top-0 left-0 ${
                                    isSelected 
                                        ? 'border-2 border-blue-600 ring-2 ring-blue-400/30 shadow-sm rounded-lg bg-blue-500/5' 
                                        : 'border border-transparent hover:border-blue-400/40 rounded-lg bg-transparent'
                                } flex items-center justify-center group z-10 cursor-move transition-all`}
                            >
                                {field.kind === 'image' ? (
                                    <img 
                                        src={field.value} 
                                        alt="Signature" 
                                        className="w-full h-full object-contain pointer-events-none select-none block" 
                                    />
                                ) : (
                                    <span 
                                        style={{ 
                                            fontSize: `${Math.max(10, Math.min(36, Math.round(field.height * 0.45)))}px`,
                                            lineHeight: 1.2
                                        }}
                                        className={`font-bold px-3 py-1 truncate pointer-events-none ${
                                            field.color === 'red' 
                                                ? 'text-red-700 bg-red-50 border border-red-200 rounded-md' 
                                                : 'text-blue-700 bg-blue-50 border border-blue-200 rounded-md'
                                        }`}
                                    >
                                        {field.value}
                                    </span>
                                )}

                                {/* Floating Quick Bubble Toolbar on Selected Signature */}
                                {isSelected && (
                                    <div 
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white px-2 py-1 rounded-xl shadow-xl flex items-center gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleScaleField(field.id, 0.85)}
                                            className="p-1 hover:bg-gray-700 rounded-lg text-xs font-bold cursor-pointer"
                                            title="Shrink signature"
                                        >
                                            <ZoomOut className="h-3 w-3" />
                                        </button>
                                        <span className="text-[10px] font-mono px-1 font-bold text-blue-300">
                                            {Math.round(field.width)}px
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleScaleField(field.id, 1.15)}
                                            className="p-1 hover:bg-gray-700 rounded-lg text-xs font-bold cursor-pointer"
                                            title="Enlarge signature"
                                        >
                                            <ZoomIn className="h-3 w-3" />
                                        </button>
                                        <div className="h-3 w-px bg-gray-700" />
                                        <button
                                            type="button"
                                            onClick={() => deleteField(field.id)}
                                            className="p-1 text-red-400 hover:bg-red-950/60 rounded-lg text-xs cursor-pointer"
                                            title="Delete signature"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {/* 4 Corner Resize Handles - Perfectly Centered & High Contrast */}
                                {isSelected && (
                                    <>
                                        {/* Top-Left */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, field, 'nw')}
                                            onTouchStart={(e) => handleResizeStart(e, field, 'nw')}
                                            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-600 border-2 border-white ring-2 ring-blue-500/50 rounded-full cursor-nwse-resize z-30 shadow-md hover:scale-125 transition-transform"
                                            title="Drag corner to resize"
                                        />
                                        {/* Top-Right */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, field, 'ne')}
                                            onTouchStart={(e) => handleResizeStart(e, field, 'ne')}
                                            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-600 border-2 border-white ring-2 ring-blue-500/50 rounded-full cursor-nesw-resize z-30 shadow-md hover:scale-125 transition-transform"
                                            title="Drag corner to resize"
                                        />
                                        {/* Bottom-Left */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, field, 'sw')}
                                            onTouchStart={(e) => handleResizeStart(e, field, 'sw')}
                                            className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 bg-blue-600 border-2 border-white ring-2 ring-blue-500/50 rounded-full cursor-nesw-resize z-30 shadow-md hover:scale-125 transition-transform"
                                            title="Drag corner to resize"
                                        />
                                        {/* Bottom-Right */}
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, field, 'se')}
                                            onTouchStart={(e) => handleResizeStart(e, field, 'se')}
                                            className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 bg-blue-600 border-2 border-white ring-2 ring-blue-500/50 rounded-full cursor-nwse-resize z-30 shadow-md hover:scale-125 transition-transform"
                                            title="Drag corner to resize"
                                        />
                                    </>
                                )}

                                {/* Delete Button on Hover */}
                                {!isSelected && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                                        className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                                        title="Delete signature"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SignPdfTool;
