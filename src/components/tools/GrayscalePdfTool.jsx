import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Printer, Download, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * Grayscale / Black & White PDF Converter Tool
 */
export const GrayscalePdfTool = () => {
    const [file, setFile] = useState(null);
    const [contrast, setContrast] = useState(1.0); // Contrast multiplier
    const [status, setStatus] = useState({ type: '', message: '' });
    const [progressText, setProgressText] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleConvert = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Converting PDF pages to grayscale...' });

        try {
            const doc = await loadPdfJsDoc(file);
            const { PDFDocument } = window.PDFLib;
            const newPdf = await PDFDocument.create();

            for (let i = 1; i <= doc.numPages; i++) {
                setProgressText(`Processing page ${i} of ${doc.numPages}...`);
                const page = await doc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: ctx, viewport }).promise;

                // Grayscale Pixel Shader
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                for (let j = 0; j < data.length; j += 4) {
                    const r = data[j];
                    const g = data[j + 1];
                    const b = data[j + 2];
                    
                    // Standard Rec. 601 Luma formula
                    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    // Contrast adjustment
                    if (contrast !== 1.0) {
                        gray = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
                        gray = Math.max(0, Math.min(255, gray));
                    }

                    data[j] = gray;
                    data[j + 1] = gray;
                    data[j + 2] = gray;
                }

                ctx.putImageData(imgData, 0, 0);

                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                const imageBytes = await blob.arrayBuffer();
                const embeddedImage = await newPdf.embedJpg(imageBytes);

                const newPage = newPdf.addPage([viewport.width, viewport.height]);
                newPage.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });
            }

            const pdfBytes = await newPdf.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `grayscale_${file.name}`);
            setStatus({ type: 'success', message: `Converted all ${doc.numPages} pages to grayscale successfully!` });

        } catch (e) {
            setStatus({ type: 'error', message: `Grayscale conversion error: ${e.message}` });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a color PDF to convert to Grayscale / B&W"}
            />

            {file && (
                <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Printer className="h-4 w-4 text-gray-700" /> Monochrome Print Optimization
                    </h3>
                    <p className="text-xs text-gray-500">
                        Removes all color channels and generates high-contrast black-and-white ink-saving documents.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Monochrome Contrast Boost: <span className="text-blue-600 font-bold">{contrast}x</span>
                        </label>
                        <input
                            type="range"
                            min="0.8"
                            max="1.5"
                            step="0.05"
                            value={contrast}
                            onChange={e => setContrast(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            )}

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            <button
                onClick={handleConvert}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Printer className="h-4 w-4" />
                {status.type === 'loading' ? 'Processing Pages...' : 'Convert to Grayscale & Download'}
            </button>
        </div>
    );
};

export default GrayscalePdfTool;
