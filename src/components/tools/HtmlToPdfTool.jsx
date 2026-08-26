import React, { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Code, Eye, Download, FileCode, Sparkles } from 'lucide-react';
import MessageBox from '../common/MessageBox.jsx';

const HTML_TEMPLATES = {
    invoice: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .title { font-size: 28px; font-weight: 800; color: #2563eb; }
    .meta { font-size: 14px; color: #64748b; text-align: right; }
    .section { margin-top: 30px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 12px; color: #475569; border-bottom: 1px solid #cbd5e1; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: 700; color: #0f172a; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">INVOICE</div>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Acme Innovations Inc.</p>
    </div>
    <div class="meta">
      <p style="margin: 0;"><strong>Invoice #:</strong> INV-2026-001</p>
      <p style="margin: 5px 0 0 0;"><strong>Date:</strong> October 12, 2026</p>
    </div>
  </div>

  <div class="section">
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Web Development & UI Consulting</td>
          <td>40 hrs</td>
          <td>$125.00</td>
          <td style="text-align: right;">$5,000.00</td>
        </tr>
        <tr>
          <td>Client-Side PDF Engine Integration</td>
          <td>1 project</td>
          <td>$2,500.00</td>
          <td style="text-align: right;">$2,500.00</td>
        </tr>
      </tbody>
    </table>
    <div class="total">Grand Total: $7,500.00</div>
  </div>
</body>
</html>`,
    report: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; padding: 40px; }
    h1 { color: #1e3a8a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; font-size: 26px; }
    h2 { color: #2563eb; font-size: 18px; margin-top: 25px; }
    p { line-height: 1.6; color: #334155; font-size: 14px; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Executive Project Summary</h1>
  <p>This report documents the architectural improvements and feature additions implemented across the browser-native document workstation.</p>
  
  <div class="highlight-box">
    <strong style="color: #1e40af;">Key Finding:</strong> Client-side PDF manipulation achieves sub-second processing latencies while ensuring strict data sovereignty.
  </div>

  <h2>Methodology & Performance</h2>
  <p>All core computational workloads—including image downsampling, cross-reference table indexing, and page imposition—are computed directly inside the local browser V8 runtime.</p>
</body>
</html>`,
    blank: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #1e293b; }
    h1 { color: #2563eb; }
    p { font-size: 15px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Your Custom Document Title</h1>
  <p>Write your formatted HTML and CSS here to generate a high-quality PDF document.</p>
</body>
</html>`
};

/**
 * HTML to PDF Tool (Client-Side HTML Rendering & PDF Compilation)
 */
export const HtmlToPdfTool = () => {
    const [htmlContent, setHtmlContent] = useState(HTML_TEMPLATES.invoice);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [pageSize, setPageSize] = useState('a4'); // 'a4' or 'letter'
    const previewIframeRef = useRef(null);

    useEffect(() => {
        if (previewIframeRef.current) {
            const doc = previewIframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();
            }
        }
    }, [htmlContent]);

    const handleTemplateSelect = (key) => {
        if (HTML_TEMPLATES[key]) {
            setHtmlContent(HTML_TEMPLATES[key]);
        }
    };

    const handleGeneratePdf = async () => {
        setStatus({ type: 'loading', message: 'Rendering HTML to vector canvas...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.create();

            // Dimensions in points (72 points = 1 inch)
            const dimensions = pageSize === 'a4' 
                ? [595.28, 841.89] 
                : [612.0, 792.0];

            // Render HTML to SVG foreignObject on Canvas
            const width = 800;
            const height = pageSize === 'a4' ? 1130 : 1035;

            const canvas = document.createElement('canvas');
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);

            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            const svgData = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    <foreignObject width="100%" height="100%">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
                            ${htmlContent}
                        </div>
                    </foreignObject>
                </svg>
            `;

            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    URL.revokeObjectURL(url);
                    resolve();
                };
                img.onerror = (e) => {
                    URL.revokeObjectURL(url);
                    reject(new Error("HTML could not be rasterized. Ensure valid HTML tags."));
                };
                img.src = url;
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            const imageBytes = await imageBlob.arrayBuffer();
            const embeddedImage = await pdfDoc.embedJpg(imageBytes);

            const page = pdfDoc.addPage(dimensions);
            page.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: dimensions[0],
                height: dimensions[1],
            });

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'converted_document.pdf');
            setStatus({ type: 'success', message: 'HTML successfully compiled to PDF! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `HTML to PDF compilation error: ${e.message}` });
        }
    };

    return (
        <div>
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">Templates:</span>
                    <button
                        onClick={() => handleTemplateSelect('invoice')}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs"
                    >
                        Invoice
                    </button>
                    <button
                        onClick={() => handleTemplateSelect('report')}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs"
                    >
                        Report
                    </button>
                    <button
                        onClick={() => handleTemplateSelect('blank')}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs"
                    >
                        Blank
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">Page Size:</span>
                    <select
                        value={pageSize}
                        onChange={e => setPageSize(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold"
                    >
                        <option value="a4">A4 (Standard)</option>
                        <option value="letter">US Letter</option>
                    </select>
                </div>
            </div>

            {/* Split Editor and Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* HTML Source Code Editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1.5">
                            <Code className="h-4 w-4 text-blue-600" /> HTML & CSS Code
                        </span>
                        <span className="text-gray-400">Live Updating</span>
                    </div>
                    <textarea
                        value={htmlContent}
                        onChange={e => setHtmlContent(e.target.value)}
                        rows={22}
                        className="w-full p-4 bg-gray-900 text-gray-100 border border-gray-800 rounded-2xl font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                        placeholder="Type HTML here..."
                    />
                </div>

                {/* Live Preview Iframe */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4 text-blue-600" /> Live Render Preview
                        </span>
                        <span className="text-gray-400 uppercase">{pageSize} format</span>
                    </div>
                    <div className="border border-gray-300 bg-white rounded-2xl shadow-md overflow-hidden aspect-[1/1.41] max-h-[480px]">
                        <iframe
                            ref={previewIframeRef}
                            title="HTML Preview"
                            className="w-full h-full border-0 pointer-events-none"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </div>
            </div>

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleGeneratePdf}
                disabled={status.type === 'loading' || !htmlContent.trim()}
                className="w-full mt-6 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Download className="h-4 w-4" />
                {status.type === 'loading' ? 'Generating PDF...' : 'Convert HTML & Download PDF'}
            </button>
        </div>
    );
};

export default HtmlToPdfTool;
