import { saveAs } from 'file-saver';

/**
 * Common PDF utility functions using PDF.js and PDF-Lib
 */

export const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getPdfJs = () => {
    return window['pdfjs-dist/build/pdf'];
};

export const getPdfLib = () => {
    return window.PDFLib;
};

/**
 * Loads a PDF file into PDF.js document representation
 */
export const loadPdfJsDoc = async (file) => {
    const pdfjsLib = getPdfJs();
    if (!pdfjsLib) throw new Error("PDF.js engine is not ready yet.");
    const arrayBuffer = await file.arrayBuffer();
    return await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
};

/**
 * Renders a specific page of a PDF onto an HTML5 canvas
 */
export const renderPageToCanvas = async (page, canvas, scale = 1.5) => {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    return { viewport, canvas };
};

/**
 * Extracts raw textual content from all pages using PDF.js text layer (client-side, no AI needed)
 */
export const extractTextFromPdf = async (file, onProgress) => {
    const doc = await loadPdfJsDoc(file);
    const numPages = doc.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
        if (onProgress) onProgress(i, numPages);
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageString = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageString}\n\n`;
    }

    return { text: fullText.trim(), numPages };
};

/**
 * Generates lightweight thumbnail images (Data URLs) for each page
 */
export const generatePdfThumbnails = async (file, maxThumbScale = 0.35) => {
    const doc = await loadPdfJsDoc(file);
    const thumbnails = [];

    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: maxThumbScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        thumbnails.push({
            id: `page-${i}-${Date.now()}`,
            pageNum: i,
            originalIndex: i - 1,
            rotation: 0,
            width: viewport.width,
            height: viewport.height,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8)
        });
    }

    return thumbnails;
};

export const downloadPdfBlob = (bytes, filename) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    saveAs(blob, filename);
};
