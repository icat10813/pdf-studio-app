import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * Crop PDF Tool: Crops the visible area of PDF pages based on user-defined margins
 */
export const CropPdfTool = () => {
    const [file, setFile] = useState(null);
    const [margins, setMargins] = useState({ top: 40, right: 40, bottom: 40, left: 40 });
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(acceptedFiles => { 
        setFile(acceptedFiles[0]); 
        setStatus({ type: '', message: '' });
    }, []);
    
    const handleCrop = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please provide a PDF file.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Cropping document pages...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            const pages = pdfDoc.getPages();
            for (const page of pages) {
                const { width, height } = page.getSize();
                const cropWidth = width - margins.left - margins.right;
                const cropHeight = height - margins.top - margins.bottom;

                if (cropWidth <= 0 || cropHeight <= 0) {
                    throw new Error("Margins are too large for page dimensions.");
                }

                page.setCropBox(
                    margins.left,
                    margins.bottom,
                    cropWidth,
                    cropHeight
                );
            }
            
            const croppedPdfBytes = await pdfDoc.save();
            saveAs(new Blob([croppedPdfBytes], { type: 'application/pdf' }), `cropped_${file.name}`);
            setStatus({ type: 'success', message: 'PDF cropped successfully! Download has started.' });
            
        } catch(e) {
            setStatus({ type: 'error', message: `Failed to crop PDF: ${e.message}` });
        }
    };

    const handleMarginChange = (e) => {
        const { name, value } = e.target;
        setMargins(prev => ({ ...prev, [name]: Math.max(0, Number(value)) }));
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop} 
                accept={{ 'application/pdf': ['.pdf'] }} 
                multiple={false} 
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF to crop"}
            />
            
            {file && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3 text-center">Set Margins to Trim (in points, 72 pt = 1 inch)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="top-margin" className="block text-xs font-medium text-gray-700 mb-1">Top Margin</label>
                            <input 
                                type="number" 
                                name="top" 
                                id="top-margin" 
                                value={margins.top} 
                                onChange={handleMarginChange} 
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="right-margin" className="block text-xs font-medium text-gray-700 mb-1">Right Margin</label>
                            <input 
                                type="number" 
                                name="right" 
                                id="right-margin" 
                                value={margins.right} 
                                onChange={handleMarginChange} 
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="bottom-margin" className="block text-xs font-medium text-gray-700 mb-1">Bottom Margin</label>
                            <input 
                                type="number" 
                                name="bottom" 
                                id="bottom-margin" 
                                value={margins.bottom} 
                                onChange={handleMarginChange} 
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="left-margin" className="block text-xs font-medium text-gray-700 mb-1">Left Margin</label>
                            <input 
                                type="number" 
                                name="left" 
                                id="left-margin" 
                                value={margins.left} 
                                onChange={handleMarginChange} 
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
            
            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleCrop}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {status.type === 'loading' ? 'Cropping Pages...' : 'Crop & Download PDF'}
            </button>
        </div>
    );
};

export default CropPdfTool;
