import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, Key, ExternalLink, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * OCR PDF Tool: Extracts text from PDF pages using the Google Gemini Vision API
 */
export const OcrPdfTool = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [extractedText, setExtractedText] = useState('');
    const [copied, setCopied] = useState(false);
    const [apiKey, setApiKey] = useState(() => {
        return localStorage.getItem('gemini_ocr_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    });
    const [maxPages, setMaxPages] = useState(3);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('gemini_ocr_api_key', apiKey);
        }
    }, [apiKey]);

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
        setExtractedText('');
    }, []);
    
    const pdfPageToBase64 = async (pdfPage) => {
        const viewport = pdfPage.getViewport({ scale: 2.0 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await pdfPage.render({ canvasContext: context, viewport }).promise;
        return canvas.toDataURL('image/png').split(',')[1];
    };

    const handleOcr = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }

        const activeKey = apiKey.trim();
        if (!activeKey) {
            setStatus({ 
                type: 'error', 
                message: 'Please provide a Google Gemini API key to run OCR text extraction.' 
            });
            return;
        }

        setStatus({ type: 'loading', message: 'Starting OCR analysis...' });
        setExtractedText('');

        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            const pdfBytes = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            
            const numPagesToProcess = Math.min(pdf.numPages, maxPages); 
            let fullText = '';
            
            for (let i = 1; i <= numPagesToProcess; i++) {
                setStatus({ type: 'loading', message: `Analyzing page ${i} of ${numPagesToProcess} with Gemini AI...` });
                const page = await pdf.getPage(i);
                const base64ImageData = await pdfPageToBase64(page);

                const prompt = "Transcribe and extract all text from this document page image verbatim, preserving layout structure, headings, and lists where applicable.";
                const payload = {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: prompt },
                                { inlineData: { mimeType: "image/png", data: base64ImageData } }
                            ]
                        }
                    ],
                };
                
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`;
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData?.error?.message || `API request failed with HTTP ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content?.parts?.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    fullText += `=== Page ${i} ===\n\n${text}\n\n`;
                } else {
                    fullText += `=== Page ${i} ===\n\n[No recognizable text detected on this page]\n\n`;
                }
            }
            
            setExtractedText(fullText.trim());
            setStatus({ type: 'success', message: `OCR complete! Extracted text from ${numPagesToProcess} document page(s).` });

        } catch (e) {
            setStatus({ type: 'error', message: `OCR failed: ${e.message}` });
        }
    };

    const handleCopy = () => {
        if (!extractedText) return;
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div>
            <canvas ref={canvasRef} className="hidden" />

            {/* API Key Configuration Section */}
            <div className="mb-6 p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <label htmlFor="gemini-key" className="text-sm font-semibold text-blue-950 flex items-center gap-1.5">
                        <Key className="h-4 w-4 text-blue-600" />
                        Google Gemini API Key
                    </label>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                        Get Free Key <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
                <input
                    type="password"
                    id="gemini-key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key (stored locally in browser)"
                    className="block w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a scanned PDF for OCR"}
            />

            {file && (
                <div className="mt-4 flex items-center justify-end gap-2 text-sm text-gray-600">
                    <span>Process up to:</span>
                    <select
                        value={maxPages}
                        onChange={e => setMaxPages(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs"
                    >
                        <option value={1}>1 Page</option>
                        <option value={3}>First 3 Pages</option>
                        <option value={5}>First 5 Pages</option>
                        <option value={10}>First 10 Pages</option>
                    </select>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleOcr}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
                <Sparkles className="h-5 w-5" />
                {status.type === 'loading' ? 'Running OCR with Gemini AI...' : 'Extract Text with Gemini AI'}
            </button>

            {extractedText && (
                <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900">Extracted Document Text</h3>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                    <span className="text-green-600">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 text-gray-500" />
                                    <span>Copy Text</span>
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        readOnly
                        value={extractedText}
                        rows={12}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-mono text-xs text-gray-800 leading-relaxed focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
};

export default OcrPdfTool;
