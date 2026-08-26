import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { FileImage, Trash2 } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * JPG to PDF Tool: Converts multiple JPG/PNG images into a single PDF document
 */
export const JpgToPdfTool = () => {
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(acceptedFiles => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleConvert = async () => {
        if (files.length === 0) {
            setStatus({ type: 'error', message: 'Please select at least one image file.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Converting images to PDF document...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const imgBytes = await file.arrayBuffer();
                let image;
                
                if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
                    image = await pdfDoc.embedPng(imgBytes);
                } else {
                    image = await pdfDoc.embedJpg(imgBytes);
                }

                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'converted_images.pdf');
            setStatus({ type: 'success', message: 'Images successfully converted to PDF! Download has started.' });
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
                accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
                multiple={true}
                text="Drag & drop JPG or PNG images"
            />

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Images to Convert ({files.length}):</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                            <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                                <span className="flex items-center text-sm font-medium text-gray-800 truncate">
                                    <FileImage className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
                                    <span className="truncate max-w-sm">{file.name}</span>
                                    <span className="text-xs text-gray-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                                </span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Remove image"
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
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {status.type === 'loading' ? 'Building PDF...' : `Convert ${files.length} Image${files.length === 1 ? '' : 's'} to PDF`}
            </button>
        </div>
    );
};

export default JpgToPdfTool;
