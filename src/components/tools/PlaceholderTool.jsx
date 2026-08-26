import React from 'react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * Placeholder for tools requiring dedicated backend or cloud service pipelines
 */
export const PlaceholderTool = ({ tool }) => {
    let detailedMessage = `The '${tool.name}' feature requires advanced processing not suitable for purely client-side browser execution.`;

    if (tool.slug === 'compress') {
        detailedMessage = "High-quality PDF compression requires advanced raster and font-subsetting algorithms. A backend server or dedicated pipeline is needed to optimize and rewrite PDF structures effectively.";
    } else if (tool.slug === 'pdf-to-word') {
        detailedMessage = "Converting PDF into editable DOCX format requires an extensive layout analysis and OCR engine to reconstruct text flows, tables, and styles accurately.";
    } else if (tool.slug === 'html-to-pdf') {
        detailedMessage = "Converting arbitrary web URLs or HTML to PDF typically requires a headless browser environment (e.g. Puppeteer / Chromium) to render CSS and JavaScript faithfully.";
    }

    return (
        <div className="text-center p-4 max-w-xl mx-auto">
            <FileUploader onFilesAccepted={() => {}} text="Feature Roadmap Preview" />
            <MessageBox type="info" message={detailedMessage} />
            <button
                disabled
                className="w-full mt-4 bg-gray-400 text-white font-bold py-3 px-4 rounded-lg opacity-60 cursor-not-allowed"
            >
                Processing Unavailable in Demo
            </button>
        </div>
    );
};

export default PlaceholderTool;
