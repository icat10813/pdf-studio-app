import { loadPdfJsDoc, getPdfLib } from './pdfHelpers.js';

/**
 * Client-Side PDF Compression & Optimization Engine
 * Re-samples and compresses image streams and rebuilds a streamlined PDF.
 */
export const compressPdfDocument = async (file, qualityLevel = 'medium', onProgress) => {
    const doc = await loadPdfJsDoc(file);
    const { PDFDocument } = getPdfLib();
    const newPdf = await PDFDocument.create();

    // Configuration settings based on compression strength
    const config = {
        low: { scale: 1.6, quality: 0.85, name: 'Light Compression (High Quality)' },
        medium: { scale: 1.2, quality: 0.65, name: 'Balanced Compression (Recommended)' },
        high: { scale: 0.9, quality: 0.45, name: 'Maximum Compression (Smallest Size)' }
    }[qualityLevel] || { scale: 1.2, quality: 0.65 };

    const totalPages = doc.numPages;

    for (let i = 1; i <= totalPages; i++) {
        if (onProgress) {
            onProgress(i, totalPages, `Compressing page ${i} of ${totalPages}...`);
        }

        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: config.scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert rendered page into compressed JPEG Blob
        const imageBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', config.quality);
        });

        const imageBytes = await imageBlob.arrayBuffer();
        const embeddedImage = await newPdf.embedJpg(imageBytes);

        // Maintain page dimensions based on viewport
        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        });
    }

    const compressedBytes = await newPdf.save({ useObjectStreams: true });
    return {
        bytes: compressedBytes,
        originalSize: file.size,
        compressedSize: compressedBytes.byteLength,
        savingsPercent: Math.max(0, Math.round(((file.size - compressedBytes.byteLength) / file.size) * 100))
    };
};
