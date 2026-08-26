import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Split, Check, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';
import { generatePdfThumbnails } from '../../utils/pdfHelpers.js';

/**
 * World-Class Split PDF Tool with Visual Thumbnail Selection & Range Inputs
 */
export const SplitTool = () => {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [rangeInput, setRangeInput] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: 'loading', message: 'Loading PDF pages...' });

        try {
            const thumbs = await generatePdfThumbnails(selected, 0.35);
            setPages(thumbs);
            // Default select all
            setSelectedIndices(new Set(thumbs.map((_, i) => i)));
            setRangeInput(`1-${thumbs.length}`);
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF: ${e.message}` });
        }
    }, []);

    const togglePageSelection = (index) => {
        const newSet = new Set(selectedIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setSelectedIndices(newSet);
        updateRangeInputFromSet(newSet);
    };

    const updateRangeInputFromSet = (set) => {
        const sorted = Array.from(set).map(i => i + 1).sort((a, b) => a - b);
        if (sorted.length === 0) {
            setRangeInput('');
            return;
        }
        setRangeInput(sorted.join(', '));
    };

    const handleRangeInputChange = (val) => {
        setRangeInput(val);
        const newSet = new Set();
        const parts = val.split(',').map(p => p.trim());
        for (const p of parts) {
            if (p.includes('-')) {
                const [start, end] = p.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.max(1, start); i <= Math.min(pages.length, end); i++) {
                        newSet.add(i - 1);
                    }
                }
            } else {
                const num = Number(p);
                if (!isNaN(num) && num >= 1 && num <= pages.length) {
                    newSet.add(num - 1);
                }
            }
        }
        setSelectedIndices(newSet);
    };

    const selectAll = () => {
        const fullSet = new Set(pages.map((_, i) => i));
        setSelectedIndices(fullSet);
        updateRangeInputFromSet(fullSet);
    };

    const clearAll = () => {
        setSelectedIndices(new Set());
        setRangeInput('');
    };

    const handleSplit = async () => {
        if (!file || selectedIndices.size === 0) {
            setStatus({ type: 'error', message: 'Please select at least one page to extract.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Extracting selected pages...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const originalDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const newDoc = await PDFDocument.create();

            const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
            const copiedPages = await newDoc.copyPages(originalDoc, sortedIndices);
            copiedPages.forEach(p => newDoc.addPage(p));

            const newPdfBytes = await newDoc.save();
            saveAs(new Blob([newPdfBytes], { type: 'application/pdf' }), `split_${file.name}`);
            setStatus({ type: 'success', message: `Extracted ${sortedIndices.length} page(s) successfully!` });
        } catch (e) {
            setStatus({ type: 'error', message: `Split error: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF to extract pages"}
            />

            {pages.length > 0 && (
                <div className="mt-6 space-y-4">
                    {/* Range input & bulk selector */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-bold text-gray-800">
                                Click thumbnails or type page numbers:
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={rangeInput}
                            onChange={e => handleRangeInputChange(e.target.value)}
                            placeholder="e.g. 1-3, 5, 8"
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Interactive Thumbnail Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {pages.map((p, idx) => {
                            const isSelected = selectedIndices.has(idx);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => togglePageSelection(idx)}
                                    className={`relative p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                        isSelected 
                                            ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 opacity-60'
                                    }`}
                                >
                                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                        <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-contain" />
                                        <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow ${
                                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center text-xs font-bold text-gray-800">
                                        Page {p.pageNum}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <MessageBox type={status.type} message={status.message} />

                    <button
                        onClick={handleSplit}
                        disabled={selectedIndices.size === 0 || status.type === 'loading'}
                        className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <Split className="h-4 w-4" />
                        {status.type === 'loading' ? 'Extracting Pages...' : `Extract & Download ${selectedIndices.size} Page(s)`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SplitTool;
