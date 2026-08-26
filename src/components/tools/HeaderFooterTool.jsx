import React, { useState, useCallback, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { AlignLeft, Download, Eye, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * Header & Footer Studio Tool
 */
export const HeaderFooterTool = () => {
    const [file, setFile] = useState(null);
    const [headerLeft, setHeaderLeft] = useState('{title}');
    const [headerCenter, setHeaderCenter] = useState('');
    const [headerRight, setHeaderRight] = useState('{date}');
    const [footerLeft, setFooterLeft] = useState('Confidential');
    const [footerCenter, setFooterCenter] = useState('');
    const [footerRight, setFooterRight] = useState('Page {page} of {total}');
    const [fontSize, setFontSize] = useState(10);
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

    const replaceMacros = (text, pageNum, totalPages, title) => {
        if (!text) return '';
        return text
            .replace(/{page}/g, pageNum)
            .replace(/{total}/g, totalPages)
            .replace(/{date}/g, new Date().toLocaleDateString())
            .replace(/{title}/g, title || 'Document');
    };

    const drawLivePreview = useCallback(() => {
        const canvas = previewCanvasRef.current;
        const bgImg = pageImageRef.current;
        if (!canvas || !bgImg) return;

        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0);

        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = '#475569';
        ctx.textBaseline = 'middle';

        const padding = 25;
        const topY = padding;
        const bottomY = canvas.height - padding;
        const docTitle = file ? file.name.replace(/\.pdf$/i, '') : 'Document';

        // Headers
        if (headerLeft) {
            ctx.textAlign = 'left';
            ctx.fillText(replaceMacros(headerLeft, 1, 10, docTitle), padding, topY);
        }
        if (headerCenter) {
            ctx.textAlign = 'center';
            ctx.fillText(replaceMacros(headerCenter, 1, 10, docTitle), canvas.width / 2, topY);
        }
        if (headerRight) {
            ctx.textAlign = 'right';
            ctx.fillText(replaceMacros(headerRight, 1, 10, docTitle), canvas.width - padding, topY);
        }

        // Footers
        if (footerLeft) {
            ctx.textAlign = 'left';
            ctx.fillText(replaceMacros(footerLeft, 1, 10, docTitle), padding, bottomY);
        }
        if (footerCenter) {
            ctx.textAlign = 'center';
            ctx.fillText(replaceMacros(footerCenter, 1, 10, docTitle), canvas.width / 2, bottomY);
        }
        if (footerRight) {
            ctx.textAlign = 'right';
            ctx.fillText(replaceMacros(footerRight, 1, 10, docTitle), canvas.width - padding, bottomY);
        }
    }, [headerLeft, headerCenter, headerRight, footerLeft, footerCenter, footerRight, fontSize, file]);

    useEffect(() => {
        drawLivePreview();
    }, [drawLivePreview]);

    const onDrop = useCallback(acceptedFiles => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: '', message: '' });
        updatePreviewBackground(selected);
    }, [updatePreviewBackground]);

    const handleApply = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Applying headers & footers across all pages...' });

        try {
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const pages = pdfDoc.getPages();
            const totalPages = pages.length;
            const docTitle = file.name.replace(/\.pdf$/i, '');
            const margin = 25;

            for (let i = 0; i < totalPages; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const pageNum = i + 1;

                const drawString = (text, align, y) => {
                    if (!text) return;
                    const resolved = replaceMacros(text, pageNum, totalPages, docTitle);
                    const textWidth = font.widthOfTextAtSize(resolved, fontSize);

                    let x = margin;
                    if (align === 'center') x = (width - textWidth) / 2;
                    if (align === 'right') x = width - textWidth - margin;

                    page.drawText(resolved, {
                        x,
                        y,
                        size: fontSize,
                        font,
                        color: rgb(0.3, 0.35, 0.4),
                    });
                };

                // Headers
                drawString(headerLeft, 'left', height - margin);
                drawString(headerCenter, 'center', height - margin);
                drawString(headerRight, 'right', height - margin);

                // Footers
                drawString(footerLeft, 'left', margin);
                drawString(footerCenter, 'center', margin);
                drawString(footerRight, 'right', margin);
            }

            const outputBytes = await pdfDoc.save();
            saveAs(new Blob([outputBytes], { type: 'application/pdf' }), `header_footer_${file.name}`);
            setStatus({ type: 'success', message: 'Headers & footers applied successfully! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `Header/Footer error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to add custom headers & footers"}
            />

            {file && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Controls */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <AlignLeft className="h-4 w-4 text-blue-600" /> Header & Footer Inputs
                            </h3>
                            <span className="text-[11px] text-gray-500">
                                Macros: <code className="text-blue-600">{'{page}'}</code>, <code className="text-blue-600">{'{total}'}</code>, <code className="text-blue-600">{'{date}'}</code>
                            </span>
                        </div>

                        {/* Headers */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700">Top Header (Left / Center / Right)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    value={headerLeft}
                                    onChange={e => setHeaderLeft(e.target.value)}
                                    placeholder="Left header"
                                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                                />
                                <input
                                    type="text"
                                    value={headerCenter}
                                    onChange={e => setHeaderCenter(e.target.value)}
                                    placeholder="Center header"
                                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                                />
                                <input
                                    type="text"
                                    value={headerRight}
                                    onChange={e => setHeaderRight(e.target.value)}
                                    placeholder="Right header"
                                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                                />
                            </div>
                        </div>

                        {/* Footers */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700">Bottom Footer (Left / Center / Right)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    value={footerLeft}
                                    onChange={e => setFooterLeft(e.target.value)}
                                    placeholder="Left footer"
                                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                                />
                                <input
                                    type="text"
                                    value={footerCenter}
                                    onChange={e => setFooterCenter(e.target.value)}
                                    placeholder="Center footer"
                                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                                />
                                <input
                                    type="text"
                                    value={footerRight}
                                    onChange={e => setFooterRight(e.target.value)}
                                    placeholder="Right footer"
                                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Font Size: <span className="text-blue-600">{fontSize}pt</span>
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="16"
                                value={fontSize}
                                onChange={e => setFontSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                            />
                        </div>

                        <MessageBox type={status.type} message={status.message} />

                        <button
                            onClick={handleApply}
                            disabled={status.type === 'loading'}
                            className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {status.type === 'loading' ? 'Applying...' : 'Apply Headers/Footers & Download'}
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-3 self-start">
                            <Eye className="h-3.5 w-3.5" /> Real-Time Preview
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

export default HeaderFooterTool;
