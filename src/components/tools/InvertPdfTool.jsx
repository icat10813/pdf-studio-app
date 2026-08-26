import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Moon, Download, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * Invert Colors (Dark Mode) PDF Tool
 */
export const InvertPdfTool = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [progressText, setProgressText] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleInvert = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Inverting PDF document color spectrum...' });

        try {
            const doc = await loadPdfJsDoc(file);
            const { PDFDocument } = window.PDFLib;
            const newPdf = await PDFDocument.create();

            for (let i = 1; i <= doc.numPages; i++) {
                setProgressText(`Inverting page ${i} of ${doc.numPages}...`);
                const page = await doc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: ctx, viewport }).promise;

                // Color Inversion
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                for (let j = 0; j < data.length; j += 4) {
                    data[j] = 255 - data[j];         // Invert Red
                    data[j + 1] = 255 - data[j + 1]; // Invert Green
                    data[j + 2] = 255 - data[j + 2]; // Invert Blue
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
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `darkmode_${file.name}`);
            setStatus({ type: 'success', message: `Dark mode inversion complete for all ${doc.numPages} pages!` });

        } catch (e) {
            setStatus({ type: 'error', message: `Invert error: ${e.message}` });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to invert colors into Dark Mode"}
            />

            {file && (
                <div className="mt-6 p-5 bg-gray-900 text-white rounded-2xl border border-gray-800 space-y-2">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-blue-400">
                        <Moon className="h-4 w-4" /> Dark Mode High-Contrast Reader
                    </h3>
                    <p className="text-xs text-gray-400">
                        Inverts bright white backgrounds into deep black while turning dark text into clean, readable light tones for comfortable reading.
                    </p>
                </div>
            )}

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            <button
                onClick={handleInvert}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Moon className="h-4 w-4" />
                {status.type === 'loading' ? 'Inverting Pages...' : 'Invert to Dark Mode & Download'}
            </button>
        </div>
    );
};

export default InvertPdfTool;
