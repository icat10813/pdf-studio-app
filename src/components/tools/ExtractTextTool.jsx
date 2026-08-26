import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { FileText, Copy, Check, Download, Search } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { extractTextFromPdf } from '../../utils/pdfHelpers.js';

/**
 * Instant Client-Side PDF Text Extractor
 */
export const ExtractTextTool = () => {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [copied, setCopied] = useState(false);
    const [progressText, setProgressText] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
        setExtractedText('');
    }, []);

    const handleExtract = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Reading document text...' });
        setExtractedText('');

        try {
            const { text, numPages } = await extractTextFromPdf(file, (curr, total) => {
                setProgressText(`Reading page ${curr} of ${total}...`);
            });

            if (!text || text.trim().length === 0) {
                setStatus({
                    type: 'info',
                    message: 'No digital text stream found. If this is a scanned document or image, please use the OCR PDF tool.'
                });
            } else {
                setExtractedText(text);
                setStatus({ type: 'success', message: `Extracted text from all ${numPages} pages successfully!` });
            }
        } catch (e) {
            setStatus({ type: 'error', message: `Text extraction error: ${e.message}` });
        }
    };

    const handleCopy = () => {
        if (!extractedText) return;
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadTxt = () => {
        if (!extractedText) return;
        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}_text.txt`);
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to extract all text"}
            />

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            <button
                onClick={handleExtract}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <FileText className="h-4 w-4" />
                {status.type === 'loading' ? 'Extracting Text...' : 'Extract All Text'}
            </button>

            {extractedText && (
                <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span>Extracted Text</span>
                            <span className="text-xs font-normal text-gray-500">
                                ({extractedText.length.toLocaleString()} characters)
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleCopy}
                                className="flex-1 sm:flex-initial px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                onClick={handleDownloadTxt}
                                className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Download className="h-3.5 w-3.5" /> Download .TXT
                            </button>
                        </div>
                    </div>

                    <textarea
                        readOnly
                        value={extractedText}
                        rows={14}
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl font-mono text-xs text-gray-800 leading-relaxed focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
};

export default ExtractTextTool;
