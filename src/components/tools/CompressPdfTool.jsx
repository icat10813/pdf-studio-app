import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Zap, Download, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { formatBytes } from '../../utils/pdfHelpers.js';
import { compressPdfDocument } from '../../utils/compressUtils.js';

/**
 * Client-Side PDF Compressor Tool
 */
export const CompressPdfTool = () => {
    const [file, setFile] = useState(null);
    const [quality, setQuality] = useState('medium');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [compressionResult, setCompressionResult] = useState(null);
    const [progressText, setProgressText] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
        setCompressionResult(null);
    }, []);

    const handleCompress = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please upload a PDF document to compress.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Compressing and optimizing document...' });
        setCompressionResult(null);

        try {
            const result = await compressPdfDocument(file, quality, (curr, total, msg) => {
                setProgressText(msg);
            });

            setCompressionResult(result);
            setStatus({ 
                type: 'success', 
                message: `Compression finished! Reduced document size by ${result.savingsPercent}%.` 
            });
        } catch (e) {
            setStatus({ type: 'error', message: `Compression failed: ${e.message}` });
        }
    };

    const handleDownload = () => {
        if (!compressionResult) return;
        const blob = new Blob([compressionResult.bytes], { type: 'application/pdf' });
        saveAs(blob, `compressed_${file.name}`);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name} (${formatBytes(file.size)})` : "Drag & drop a PDF to compress & shrink size"}
            />

            {file && !compressionResult && (
                <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" /> Choose Compression Strength
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { id: 'low', label: 'Light', desc: 'High visual fidelity, mild reduction', tag: 'Fast' },
                            { id: 'medium', label: 'Balanced', desc: 'Optimal size-to-quality ratio', tag: 'Recommended' },
                            { id: 'high', label: 'Maximum', desc: 'Smallest file size for emails & web', tag: 'Max Savings' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setQuality(opt.id)}
                                className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                                    quality === opt.id 
                                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                {opt.tag && (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        quality === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {opt.tag}
                                    </span>
                                )}
                                <h4 className="font-bold text-gray-900 text-sm mt-2">{opt.label}</h4>
                                <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <MessageBox type={status.type} message={status.type === 'loading' ? progressText || status.message : status.message} />

            {file && !compressionResult && (
                <button
                    onClick={handleCompress}
                    disabled={status.type === 'loading'}
                    className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    <Sparkles className="h-4 w-4" />
                    {status.type === 'loading' ? 'Compressing Document...' : 'Compress PDF'}
                </button>
            )}

            {compressionResult && (
                <div className="mt-6 p-6 bg-green-50/60 border border-green-200 rounded-2xl text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-full">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <h3 className="text-xl font-bold text-green-950">Document Successfully Compressed!</h3>

                    <div className="flex items-center justify-center gap-4 text-sm font-medium">
                        <div className="p-3 bg-white border border-green-200 rounded-xl shadow-xs">
                            <span className="text-xs text-gray-500 block">Original Size</span>
                            <span className="text-base font-bold text-gray-800">{formatBytes(compressionResult.originalSize)}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-green-600" />
                        <div className="p-3 bg-white border border-green-200 rounded-xl shadow-xs">
                            <span className="text-xs text-gray-500 block">New Size</span>
                            <span className="text-base font-bold text-green-700">{formatBytes(compressionResult.compressedSize)}</span>
                        </div>
                        <div className="p-3 bg-green-600 text-white rounded-xl shadow-xs">
                            <span className="text-xs text-green-100 block">Reduction</span>
                            <span className="text-base font-bold">-{compressionResult.savingsPercent}%</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-base"
                    >
                        <Download className="h-5 w-5" /> Download Optimized PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompressPdfTool;
