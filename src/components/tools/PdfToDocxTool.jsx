import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { FileType, Download, Copy, Check, Sparkles, FileText } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { loadPdfJsDoc } from '../../utils/pdfHelpers.js';

/**
 * PDF to Word / DOCX & Formatted Document Converter
 */
export const PdfToDocxTool = () => {
    const [file, setFile] = useState(null);
    const [extractedHtml, setExtractedHtml] = useState('');
    const [extractedMarkdown, setExtractedMarkdown] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [copied, setCopied] = useState(false);
    const [progressText, setProgressText] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
        setExtractedHtml('');
        setExtractedMarkdown('');
    }, []);

    const handleConvert = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file to convert.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Analyzing document typography & paragraphs...' });
        setExtractedHtml('');
        setExtractedMarkdown('');

        try {
            const doc = await loadPdfJsDoc(file);
            setTotalPages(doc.numPages);

            let htmlOutput = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset="utf-8">
                    <title>${file.name}</title>
                    <style>
                        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
                        h1 { font-size: 18pt; color: #1f4e78; margin-top: 18pt; margin-bottom: 6pt; }
                        h2 { font-size: 14pt; color: #2e75b6; margin-top: 14pt; margin-bottom: 4pt; }
                        p { margin-bottom: 8pt; }
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
            `;

            let markdownOutput = '';

            for (let p = 1; p <= doc.numPages; p++) {
                setProgressText(`Processing page ${p} of ${doc.numPages}...`);
                const page = await doc.getPage(p);
                const textContent = await page.getTextContent();
                
                let pageHtml = `<div class="page page-${p}">`;
                let pageMd = `\n\n## Page ${p}\n\n`;

                // Group items into lines
                const lines = {};
                for (const item of textContent.items) {
                    const y = Math.round(item.transform[5]);
                    if (!lines[y]) lines[y] = [];
                    lines[y].push(item);
                }

                // Sort lines by Y descending (top to bottom)
                const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);

                for (const y of sortedY) {
                    const lineItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
                    const lineStr = lineItems.map(item => item.str).join(' ').trim();
                    if (!lineStr) continue;

                    const maxFontSize = Math.max(...lineItems.map(item => item.height || 10));

                    if (maxFontSize > 16) {
                        pageHtml += `<h1>${lineStr}</h1>`;
                        pageMd += `# ${lineStr}\n\n`;
                    } else if (maxFontSize > 13) {
                        pageHtml += `<h2>${lineStr}</h2>`;
                        pageMd += `## ${lineStr}\n\n`;
                    } else {
                        pageHtml += `<p>${lineStr}</p>`;
                        pageMd += `${lineStr}\n\n`;
                    }
                }

                pageHtml += `</div><div class="page-break"></div>`;
                htmlOutput += pageHtml;
                markdownOutput += pageMd;
            }

            htmlOutput += `</body></html>`;

            setExtractedHtml(htmlOutput);
            setExtractedMarkdown(markdownOutput.trim());
            setStatus({ 
                type: 'success', 
                message: `Successfully converted ${doc.numPages} page(s) into editable Word document structure!` 
            });

        } catch (e) {
            setStatus({ type: 'error', message: `Conversion error: ${e.message}` });
        }
    };

    const handleDownloadDoc = () => {
        if (!extractedHtml) return;
        const blob = new Blob(['\ufeff', extractedHtml], {
            type: 'application/msword'
        });
        saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}.doc`);
    };

    const handleDownloadMd = () => {
        if (!extractedMarkdown) return;
        const blob = new Blob([extractedMarkdown], {
            type: 'text/markdown;charset=utf-8'
        });
        saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}.md`);
    };

    const handleCopy = () => {
        if (!extractedMarkdown) return;
        navigator.clipboard.writeText(extractedMarkdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to convert to editable Word (.doc) / Markdown"}
            />

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            <button
                onClick={handleConvert}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <FileType className="h-4 w-4" />
                {status.type === 'loading' ? 'Reconstructing Document...' : 'Convert to Word Document'}
            </button>

            {extractedMarkdown && (
                <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Editable Document Content Ready
                        </h3>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs flex items-center gap-1"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? 'Copied' : 'Copy Text'}
                            </button>
                            <button
                                onClick={handleDownloadMd}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs flex items-center gap-1"
                            >
                                <Download className="h-3.5 w-3.5" /> .MD
                            </button>
                            <button
                                onClick={handleDownloadDoc}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                            >
                                <Download className="h-3.5 w-3.5" /> Download .DOC (Word)
                            </button>
                        </div>
                    </div>

                    <textarea
                        readOnly
                        value={extractedMarkdown}
                        rows={12}
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl font-mono text-xs text-gray-800 leading-relaxed focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
};

export default PdfToDocxTool;
