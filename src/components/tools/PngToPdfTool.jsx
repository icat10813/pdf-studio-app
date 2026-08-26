import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { FileImage, Trash2, Download } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { formatBytes } from '../../utils/pdfHelpers.js';

/**
 * PNG to PDF Tool
 */
export const PngToPdfTool = () => {
    const [files, setFiles] = useState([]);
    const [fitMode, setFitMode] = useState('fit'); // 'fit' (A4), 'original' (exact image size)
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(acceptedFiles => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleConvert = async () => {
        if (files.length === 0) return;
        setStatus({ type: 'loading', message: `Compiling ${files.length} PNGs into PDF...` });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const imgBytes = await file.arrayBuffer();
                const image = await pdfDoc.embedPng(imgBytes);

                if (fitMode === 'original') {
                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                } else {
                    // Standard A4
                    const a4Width = 595.28;
                    const a4Height = 841.89;
                    const scale = Math.min(a4Width / image.width, a4Height / image.height);
                    const drawWidth = image.width * scale;
                    const drawHeight = image.height * scale;

                    const page = pdfDoc.addPage([a4Width, a4Height]);
                    page.drawImage(image, {
                        x: (a4Width - drawWidth) / 2,
                        y: (a4Height - drawHeight) / 2,
                        width: drawWidth,
                        height: drawHeight,
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'compiled_from_png.pdf');
            setStatus({ type: 'success', message: 'PNG images compiled to PDF successfully!' });

        } catch (e) {
            setStatus({ type: 'error', message: `Conversion error: ${e.message}` });
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'image/png': ['.png'] }}
                multiple={true}
                text="Drag & drop PNG images to compile into PDF"
            />

            {files.length > 0 && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-bold text-gray-800">
                            {files.length} PNG Image(s) Added
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 font-semibold">Page Sizing:</span>
                            <select
                                value={fitMode}
                                onChange={e => setFitMode(e.target.value)}
                                className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs"
                            >
                                <option value="fit">Fit to Standard A4 Page</option>
                                <option value="original">Match Original PNG Dimensions</option>
                            </select>
                        </div>
                    </div>

                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                            <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-xl shadow-2xs">
                                <span className="flex items-center text-xs font-semibold text-gray-800 truncate">
                                    <FileImage className="h-4 w-4 mr-2 text-emerald-500 shrink-0" />
                                    <span className="truncate max-w-sm">{file.name}</span>
                                    <span className="text-[11px] text-gray-400 ml-2">({formatBytes(file.size)})</span>
                                </span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleConvert}
                disabled={files.length === 0 || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <FileImage className="h-4 w-4" />
                {status.type === 'loading' ? 'Compiling PDF...' : `Compile ${files.length} PNGs to PDF`}
            </button>
        </div>
    );
};

export default PngToPdfTool;
