import * as PDFLib from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pixelmatch from 'pixelmatch';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
    window.PDFLib = PDFLib;
    window['pdfjs-dist/build/pdf'] = pdfjsLib;
    window.pixelmatch = pixelmatch;

    // Use bundled pdfjs worker
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();
    } catch (e) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }
}

/**
 * Initializes all PDF processing engines instantly from local npm bundle
 */
export const loadPdfLibraries = async () => {
    window.PDFLib = PDFLib;
    window['pdfjs-dist/build/pdf'] = pdfjsLib;
    window.pixelmatch = pixelmatch;
    return true;
};

export default loadPdfLibraries;
