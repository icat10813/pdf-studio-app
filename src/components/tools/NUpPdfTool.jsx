import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Grid, Download, Sparkles } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * N-Up Multi-Page Per Sheet Imposition Tool (Handouts & Booklets)
 */
export const NUpPdfTool = () => {
    const [file, setFile] = useState(null);
    const [layout, setLayout] = useState('2'); // '2', '4', '6'
    const [orientation, setOrientation] = useState('landscape'); // 'landscape', 'portrait'
    const [drawBorders, setDrawBorders] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleImpose = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Arranging multi-page layout imposition...' });

        try {
            const { PDFDocument, rgb } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const sourceDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const newDoc = await PDFDocument.create();

            const n = Number(layout); // 2, 4, or 6
            const totalSourcePages = sourceDoc.getPageCount();
            
            // Standard A4 dimensions
            const sheetWidth = orientation === 'landscape' ? 841.89 : 595.28;
            const sheetHeight = orientation === 'landscape' ? 595.28 : 841.89;

            const margin = 25;
            const gap = 15;

            // Determine grid rows and cols
            let cols = 2;
            let rows = 1;
            if (n === 4) { cols = 2; rows = 2; }
            if (n === 6) { cols = 3; rows = 2; }

            const cellWidth = (sheetWidth - (margin * 2) - ((cols - 1) * gap)) / cols;
            const cellHeight = (sheetHeight - (margin * 2) - ((rows - 1) * gap)) / rows;

            for (let i = 0; i < totalSourcePages; i += n) {
                const sheet = newDoc.addPage([sheetWidth, sheetHeight]);

                for (let slot = 0; slot < n; slot++) {
                    const pageIndex = i + slot;
                    if (pageIndex >= totalSourcePages) break;

                    const [embeddedPage] = await newDoc.embedPages([sourceDoc.getPage(pageIndex)]);
                    const origWidth = embeddedPage.width;
                    const origHeight = embeddedPage.height;

                    // Compute aspect ratio scaling
                    const scale = Math.min(cellWidth / origWidth, cellHeight / origHeight);
                    const drawWidth = origWidth * scale;
                    const drawHeight = origHeight * scale;

                    const colIndex = slot % cols;
                    const rowIndex = Math.floor(slot / cols);

                    const cellX = margin + colIndex * (cellWidth + gap);
                    const cellY = sheetHeight - margin - (rowIndex + 1) * cellHeight - rowIndex * gap;

                    // Center within cell
                    const posX = cellX + (cellWidth - drawWidth) / 2;
                    const posY = cellY + (cellHeight - drawHeight) / 2;

                    sheet.drawPage(embeddedPage, {
                        x: posX,
                        y: posY,
                        xScale: scale,
                        yScale: scale
                    });

                    if (drawBorders) {
                        sheet.drawRectangle({
                            x: posX,
                            y: posY,
                            width: drawWidth,
                            height: drawHeight,
                            borderColor: rgb(0.8, 0.8, 0.8),
                            borderWidth: 0.5,
                        });
                    }
                }
            }

            const outputBytes = await newDoc.save();
            saveAs(new Blob([outputBytes], { type: 'application/pdf' }), `handout_${n}up_${file.name}`);
            setStatus({ type: 'success', message: `Imposition complete! Generated ${newDoc.getPageCount()} sheet(s).` });

        } catch (e) {
            setStatus({ type: 'error', message: `Imposition error: ${e.message}` });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to arrange multiple pages per sheet"}
            />

            {file && (
                <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Grid className="h-4 w-4 text-blue-600" /> N-Up Layout Settings
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { id: '2', label: '2-Up', desc: '2 pages per sheet' },
                            { id: '4', label: '4-Up', desc: '4 pages (2x2 grid)' },
                            { id: '6', label: '6-Up', desc: '6 pages (3x2 grid)' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setLayout(opt.id)}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    layout === opt.id 
                                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <h4 className="font-bold text-gray-900 text-sm">{opt.label}</h4>
                                <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Sheet Orientation</label>
                            <select
                                value={orientation}
                                onChange={e => setOrientation(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="landscape">Landscape (Recommended)</option>
                                <option value="portrait">Portrait</option>
                            </select>
                        </div>

                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={drawBorders}
                                    onChange={e => setDrawBorders(e.target.checked)}
                                    className="rounded text-blue-600 h-4 w-4"
                                />
                                <span className="text-xs font-semibold text-gray-700">Draw page borders</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleImpose}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Grid className="h-4 w-4" />
                {status.type === 'loading' ? 'Compiling Handout...' : `Create ${layout}-Up Handout PDF`}
            </button>
        </div>
    );
};

export default NUpPdfTool;
