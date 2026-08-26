import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { RotateCw, RotateCcw } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { generatePdfThumbnails } from '../../utils/pdfHelpers.js';

/**
 * Visual Rotate PDF Tool
 */
export const RotatePdfTool = () => {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: 'loading', message: 'Loading PDF preview...' });

        try {
            const thumbs = await generatePdfThumbnails(selected, 0.35);
            setPages(thumbs);
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF: ${e.message}` });
        }
    }, []);

    const rotateAll = (deg) => {
        setPages(prev => prev.map(p => ({
            ...p,
            rotation: (p.rotation + deg + 360) % 360
        })));
    };

    const rotateSingle = (index, deg = 90) => {
        setPages(prev => prev.map((p, i) => {
            if (i === index) {
                return { ...p, rotation: (p.rotation + deg + 360) % 360 };
            }
            return p;
        }));
    };

    const handleSave = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Applying page rotations...' });

        try {
            const { PDFDocument, degrees } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            const docPages = pdfDoc.getPages();
            pages.forEach((p, idx) => {
                if (docPages[idx] && p.rotation !== 0) {
                    const currentRot = docPages[idx].getRotation().angle;
                    docPages[idx].setRotation(degrees((currentRot + p.rotation) % 360));
                }
            });

            const rotatedPdfBytes = await pdfDoc.save();
            saveAs(new Blob([rotatedPdfBytes], { type: 'application/pdf' }), `rotated_${file.name}`);
            setStatus({ type: 'success', message: 'PDF rotated successfully! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `Rotation error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF to rotate"}
            />

            <MessageBox type={status.type} message={status.message} />

            {pages.length > 0 && (
                <div className="mt-6 space-y-4">
                    {/* Batch Rotate Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-sm font-bold text-gray-800">
                            Rotate All Pages:
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => rotateAll(-90)}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1 shadow-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> -90° Left
                            </button>
                            <button
                                onClick={() => rotateAll(90)}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1 shadow-xs"
                            >
                                <RotateCw className="h-3.5 w-3.5" /> +90° Right
                            </button>
                            <button
                                onClick={() => rotateAll(180)}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors shadow-xs"
                            >
                                180° Flip
                            </button>
                        </div>
                    </div>

                    {/* Visual Page Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {pages.map((p, idx) => (
                            <div key={p.id} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col items-center">
                                <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                    <img
                                        src={p.dataUrl}
                                        alt={`Page ${p.pageNum}`}
                                        style={{ transform: `rotate(${p.rotation}deg)` }}
                                        className="w-full h-full object-contain transition-transform duration-200"
                                    />
                                    {p.rotation !== 0 && (
                                        <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                            {p.rotation}°
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between w-full mt-2 text-xs font-bold text-gray-700">
                                    <span>Page {p.pageNum}</span>
                                    <button
                                        onClick={() => rotateSingle(idx, 90)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Rotate 90°"
                                    >
                                        <RotateCw className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={status.type === 'loading'}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {status.type === 'loading' ? 'Applying Rotations...' : 'Save & Download Rotated PDF'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RotatePdfTool;
