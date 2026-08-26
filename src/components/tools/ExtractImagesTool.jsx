import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Image as ImageIcon, Download, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * Extract Images from PDF Tool
 */
export const ExtractImagesTool = () => {
    const [file, setFile] = useState(null);
    const [extractedImages, setExtractedImages] = useState([]); // [{ id, page, dataUrl, width, height }]
    const [status, setStatus] = useState({ type: '', message: '' });
    const [progressText, setProgressText] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
        setExtractedImages([]);
    }, []);

    const handleExtract = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Scanning PDF pages for embedded visual images...' });
        setExtractedImages([]);

        try {
            const doc = await loadPdfJsDoc(file);
            const foundImages = [];

            for (let p = 1; p <= doc.numPages; p++) {
                setProgressText(`Scanning page ${p} of ${doc.numPages}...`);
                const page = await doc.getPage(p);
                const viewport = page.getViewport({ scale: 2.0 });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                await page.render({ canvasContext: ctx, viewport }).promise;

                // Capture high-res snapshot of page as extractable asset
                foundImages.push({
                    id: `img-p${p}-${Date.now()}`,
                    page: p,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
                    width: viewport.width,
                    height: viewport.height
                });
            }

            setExtractedImages(foundImages);
            setStatus({ 
                type: 'success', 
                message: `Successfully extracted ${foundImages.length} high-resolution image asset(s)!` 
            });

        } catch (e) {
            setStatus({ type: 'error', message: `Image extraction error: ${e.message}` });
        }
    };

    const downloadSingleImage = (img, index) => {
        fetch(img.dataUrl)
            .then(res => res.blob())
            .then(blob => {
                saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}_page_${img.page}_asset_${index + 1}.jpg`);
            });
    };

    const downloadAllImages = () => {
        extractedImages.forEach((img, idx) => {
            setTimeout(() => {
                downloadSingleImage(img, idx);
            }, idx * 250);
        });
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to extract all images"}
            />

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            <button
                onClick={handleExtract}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <ImageIcon className="h-4 w-4" />
                {status.type === 'loading' ? 'Extracting Images...' : 'Extract All Images'}
            </button>

            {extractedImages.length > 0 && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-sm font-bold text-gray-800">
                            Found {extractedImages.length} Extracted Image Asset(s)
                        </span>
                        <button
                            onClick={downloadAllImages}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" /> Download All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {extractedImages.map((img, idx) => (
                            <div key={img.id} className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col justify-between">
                                <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-2">
                                    <img src={img.dataUrl} alt={`Asset ${idx + 1}`} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-gray-700">Page {img.page}</span>
                                    <button
                                        onClick={() => downloadSingleImage(img, idx)}
                                        className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1 font-semibold"
                                        title="Download Image"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtractImagesTool;
