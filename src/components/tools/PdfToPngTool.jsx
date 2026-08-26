import React, { useState, useCallback, useRef } from 'react';
import { saveAs } from 'file-saver';
import { FileImage, Download } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * PDF to Transparent / Lossless PNG Tool
 */
export const PdfToPngTool = () => {
    const [file, setFile] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedPage, setSelectedPage] = useState(1);
    const [status, setStatus] = useState({ type: '', message: '' });
    const canvasRef = useRef(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: 'loading', message: 'Loading PDF document...' });

        try {
            const doc = await loadPdfJsDoc(selected);
            setTotalPages(doc.numPages);
            setSelectedPage(1);
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF: ${e.message}` });
        }
    }, []);

    const handleConvert = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: `Rendering Page ${selectedPage} to lossless PNG...` });

        try {
            const doc = await loadPdfJsDoc(file);
            const page = await doc.getPage(selectedPage);
            const viewport = page.getViewport({ scale: 2.0 });

            const canvas = canvasRef.current;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            canvas.toBlob((blob) => {
                if (blob) {
                    saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}_page_${selectedPage}.png`);
                    setStatus({ type: 'success', message: `Page ${selectedPage} exported to PNG successfully!` });
                }
            }, 'image/png');

        } catch (e) {
            setStatus({ type: 'error', message: `PNG export error: ${e.message}` });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF to convert to PNG"}
            />

            {totalPages > 0 && (
                <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Select Page to Export (Total {totalPages} Pages)
                    </label>
                    <select
                        value={selectedPage}
                        onChange={e => setSelectedPage(Number(e.target.value))}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <option key={p} value={p}>Page {p}</option>
                        ))}
                    </select>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleConvert}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <FileImage className="h-4 w-4" />
                {status.type === 'loading' ? 'Rendering PNG...' : `Export Page ${selectedPage} as Lossless PNG`}
            </button>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default PdfToPngTool;
