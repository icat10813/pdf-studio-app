import React, { useState, useCallback, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { ListOrdered, Eye } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * World-Class Page Numbering Tool with Live Visual Preview & Custom Offset
 */
export const PageNumberTool = () => {
    const [file, setFile] = useState(null);
    const [position, setPosition] = useState('bottom-center');
    const [format, setFormat] = useState('x-of-y');
    const [startNumber, setStartNumber] = useState(1);
    const [skipFirstPage, setSkipFirstPage] = useState(false);
    const [fontSize, setFontSize] = useState(11);
    const [status, setStatus] = useState({ type: '', message: '' });

    const previewCanvasRef = useRef(null);
    const pageImageRef = useRef(null);

    const updatePreviewBackground = useCallback(async (selectedFile) => {
        try {
            const doc = await loadPdfJsDoc(selectedFile);
            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const ctx = tempCanvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport }).promise;
            pageImageRef.current = tempCanvas;
            drawLivePreview();
        } catch (e) {
            console.error("Preview error:", e);
        }
    }, []);

    const drawLivePreview = useCallback(() => {
        const canvas = previewCanvasRef.current;
        const bgImg = pageImageRef.current;
        if (!canvas || !bgImg) return;

        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0);

        if (skipFirstPage) {
            // First page skipped indicator
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[Page 1 Number Skipped]', canvas.width / 2, canvas.height - 25);
            return;
        }

        let previewText = '';
        if (format === 'x-of-y') previewText = `${startNumber} / 10`;
        else if (format === 'page-x-of-y') previewText = `Page ${startNumber} of 10`;
        else if (format === 'dash') previewText = `- ${startNumber} -`;
        else previewText = `${startNumber}`;

        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = '#374151';
        ctx.textBaseline = 'middle';

        const padding = 30;
        let x = canvas.width / 2;
        let y = canvas.height - padding;

        if (position === 'bottom-left') {
            x = padding;
            ctx.textAlign = 'left';
        } else if (position === 'bottom-right') {
            x = canvas.width - padding;
            ctx.textAlign = 'right';
        } else if (position === 'bottom-center') {
            x = canvas.width / 2;
            ctx.textAlign = 'center';
        } else if (position === 'top-left') {
            x = padding;
            y = padding;
            ctx.textAlign = 'left';
        } else if (position === 'top-center') {
            x = canvas.width / 2;
            y = padding;
            ctx.textAlign = 'center';
        } else if (position === 'top-right') {
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = 'right';
        }

        ctx.fillText(previewText, x, y);
    }, [position, format, startNumber, skipFirstPage, fontSize]);

    useEffect(() => {
        drawLivePreview();
    }, [drawLivePreview]);

    const onDrop = useCallback(acceptedFiles => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: '', message: '' });
        updatePreviewBackground(selected);
    }, [updatePreviewBackground]);

    const handleProcess = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Inserting page numbers...' });

        try {
            const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            for (let i = 0; i < totalPages; i++) {
                if (i === 0 && skipFirstPage) continue;

                const page = pages[i];
                const { width, height } = page.getSize();
                const currentNum = startNumber + i - (skipFirstPage ? 1 : 0);

                let pageText = '';
                if (format === 'x-of-y') pageText = `${currentNum} / ${totalPages}`;
                else if (format === 'page-x-of-y') pageText = `Page ${currentNum} of ${totalPages}`;
                else if (format === 'dash') pageText = `- ${currentNum} -`;
                else pageText = `${currentNum}`;

                const textWidth = font.widthOfTextAtSize(pageText, fontSize);
                const margin = 28;

                let x = (width - textWidth) / 2;
                let y = margin;

                switch (position) {
                    case 'bottom-center':
                        x = (width - textWidth) / 2;
                        y = margin;
                        break;
                    case 'bottom-right':
                        x = width - textWidth - margin;
                        y = margin;
                        break;
                    case 'bottom-left':
                        x = margin;
                        y = margin;
                        break;
                    case 'top-center':
                        x = (width - textWidth) / 2;
                        y = height - margin;
                        break;
                    case 'top-right':
                        x = width - textWidth - margin;
                        y = height - margin;
                        break;
                    case 'top-left':
                        x = margin;
                        y = height - margin;
                        break;
                    default:
                        x = (width - textWidth) / 2;
                        y = margin;
                }

                page.drawText(pageText, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0.25, 0.25, 0.25),
                });
            }

            const numberedBytes = await pdfDoc.save();
            saveAs(new Blob([numberedBytes], { type: 'application/pdf' }), `numbered_${file.name}`);
            setStatus({ type: 'success', message: 'Page numbers successfully added! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `Numbering error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to add pagination"}
            />

            {file && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Controls */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <ListOrdered className="h-4 w-4 text-blue-600" /> Pagination Settings
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Position</label>
                                <select
                                    value={position}
                                    onChange={e => setPosition(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="bottom-center">Bottom Center</option>
                                    <option value="bottom-right">Bottom Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="top-center">Top Center</option>
                                    <option value="top-right">Top Right</option>
                                    <option value="top-left">Top Left</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Format</label>
                                <select
                                    value={format}
                                    onChange={e => setFormat(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="x-of-y">"1 / 10"</option>
                                    <option value="page-x-of-y">"Page 1 of 10"</option>
                                    <option value="dash">"- 1 -"</option>
                                    <option value="x">"1" (Number only)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Number</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={startNumber}
                                    onChange={e => setStartNumber(Number(e.target.value))}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Font Size</label>
                                <input
                                    type="number"
                                    min="8"
                                    max="24"
                                    value={fontSize}
                                    onChange={e => setFontSize(Number(e.target.value))}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 pt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={skipFirstPage}
                                onChange={e => setSkipFirstPage(e.target.checked)}
                                className="rounded text-blue-600 h-4 w-4"
                            />
                            <span className="text-xs font-semibold text-gray-700">Skip cover page (do not number page 1)</span>
                        </label>

                        <MessageBox type={status.type} message={status.message} />

                        <button
                            onClick={handleProcess}
                            disabled={status.type === 'loading'}
                            className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {status.type === 'loading' ? 'Numbering Pages...' : 'Apply Numbers & Download PDF'}
                        </button>
                    </div>

                    {/* Live Preview */}
                    <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-3 self-start">
                            <Eye className="h-3.5 w-3.5" /> Position Indicator Preview
                        </div>
                        <div className="border border-gray-300 bg-white rounded-lg shadow-md max-h-[460px] overflow-hidden">
                            <canvas ref={previewCanvasRef} className="max-w-full h-auto object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageNumberTool;
