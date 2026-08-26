import React, { useState, useRef } from 'react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * Compare PDF Tool: Visually compares the first page of two PDF files and highlights differences
 */
export const ComparePdfTool = () => {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [diffResult, setDiffResult] = useState(null);
    const [diffCount, setDiffCount] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const canvas1Ref = useRef(null);
    const canvas2Ref = useRef(null);
    const diffCanvasRef = useRef(null);
    
    const handleCompare = async () => {
        if (!file1 || !file2) {
            setStatus({ type: 'error', message: 'Please provide both original and revised PDF files to compare.' });
            return;
        }

        if (typeof window.pixelmatch === 'undefined') {
            setStatus({ type: 'error', message: 'Comparison library (pixelmatch) is not loaded. Check network or reload page.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Comparing PDFs (page 1)...' });
        setDiffResult(null);
        setDiffCount(null);

        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            
            const renderPage = async (file, canvas) => {
                const pdfBytes = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport }).promise;
                return {
                    width: viewport.width,
                    height: viewport.height,
                    data: context.getImageData(0, 0, canvas.width, canvas.height)
                };
            };
            
            const [img1, img2] = await Promise.all([
                renderPage(file1, canvas1Ref.current),
                renderPage(file2, canvas2Ref.current)
            ]);

            const width = Math.max(img1.width, img2.width);
            const height = Math.max(img1.height, img2.height);

            const diffCanvas = diffCanvasRef.current;
            diffCanvas.width = width;
            diffCanvas.height = height;
            const diffCtx = diffCanvas.getContext('2d');
            const diffImageData = diffCtx.createImageData(width, height);
            
            const numDiffPixels = window.pixelmatch(
                img1.data.data, 
                img2.data.data, 
                diffImageData.data, 
                width, 
                height,
                { threshold: 0.1, includeAA: true, diffColor: [239, 68, 68] }
            );

            diffCtx.putImageData(diffImageData, 0, 0);
            setDiffResult(diffCanvas.toDataURL());
            setDiffCount(numDiffPixels);
            
            if (numDiffPixels === 0) {
                setStatus({ type: 'success', message: 'The compared pages are visually identical!' });
            } else {
                setStatus({ type: 'info', message: `Found ${numDiffPixels.toLocaleString()} differing pixels.` });
            }

        } catch(e) {
            setStatus({ type: 'error', message: `Failed to compare PDFs: ${e.message}` });
        }
    };
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploader 
                    onFilesAccepted={files => { setFile1(files[0]); setStatus({ type: '', message: '' }); }} 
                    accept={{ 'application/pdf': ['.pdf'] }} 
                    multiple={false} 
                    text={file1 ? `Original: ${file1.name}` : "Drop Original (File 1)"} 
                />
                <FileUploader 
                    onFilesAccepted={files => { setFile2(files[0]); setStatus({ type: '', message: '' }); }} 
                    accept={{ 'application/pdf': ['.pdf'] }} 
                    multiple={false} 
                    text={file2 ? `Revised: ${file2.name}` : "Drop Revised (File 2)"} 
                />
            </div>
            
            <MessageBox type={status.type} message={status.message} />
            
            <button 
                onClick={handleCompare} 
                disabled={!file1 || !file2 || status.type === 'loading'} 
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {status.type === 'loading' ? 'Comparing Document Pages...' : 'Compare First Pages'}
            </button>
            
            {diffResult && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">Visual Comparison Diff</h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Discrepancies and differences between File 1 and File 2 are highlighted in <span className="text-red-600 font-semibold">red</span>.
                        {diffCount !== null && ` (${diffCount.toLocaleString()} changed pixels)`}
                    </p>
                    <div className="max-w-2xl mx-auto border rounded-lg overflow-hidden bg-white shadow-sm">
                        <img src={diffResult} alt="PDF Visual Difference" className="w-full h-auto" />
                    </div>
                </div>
            )}
            
            <canvas ref={canvas1Ref} className="hidden" />
            <canvas ref={canvas2Ref} className="hidden" />
            <canvas ref={diffCanvasRef} className="hidden" />
        </div>
    );
};

export default ComparePdfTool;
