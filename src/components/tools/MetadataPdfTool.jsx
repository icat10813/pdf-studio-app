import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Info, Save } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * PDF Metadata & Properties Inspector and Editor Tool
 */
export const MetadataPdfTool = () => {
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState({
        title: '',
        author: '',
        subject: '',
        keywords: '',
        creator: '',
        producer: '',
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(async (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setStatus({ type: 'loading', message: 'Reading document properties...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            setMetadata({
                title: pdfDoc.getTitle() || '',
                author: pdfDoc.getAuthor() || '',
                subject: pdfDoc.getSubject() || '',
                keywords: (pdfDoc.getKeywords() || []).join(', '),
                creator: pdfDoc.getCreator() || '',
                producer: pdfDoc.getProducer() || '',
            });

            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load metadata: ${e.message}` });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMetadata(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Updating metadata & saving PDF...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            if (metadata.title) pdfDoc.setTitle(metadata.title);
            if (metadata.author) pdfDoc.setAuthor(metadata.author);
            if (metadata.subject) pdfDoc.setSubject(metadata.subject);
            if (metadata.keywords) {
                pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()).filter(Boolean));
            }
            if (metadata.creator) pdfDoc.setCreator(metadata.creator);
            if (metadata.producer) pdfDoc.setProducer(metadata.producer);

            pdfDoc.setModificationDate(new Date());

            const newPdfBytes = await pdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `metadata_updated_${file.name}`);
            setStatus({ type: 'success', message: 'Metadata updated successfully! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `Failed to save metadata: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to view & edit metadata"}
            />

            {file && (
                <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" /> Document Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Document Title</label>
                            <input
                                type="text"
                                name="title"
                                value={metadata.title}
                                onChange={handleChange}
                                placeholder="e.g. Annual Report 2026"
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Author / Organization</label>
                            <input
                                type="text"
                                name="author"
                                value={metadata.author}
                                onChange={handleChange}
                                placeholder="e.g. John Doe / Acme Corp"
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={metadata.subject}
                                onChange={handleChange}
                                placeholder="e.g. Financial Summary"
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Keywords (comma separated)</label>
                            <input
                                type="text"
                                name="keywords"
                                value={metadata.keywords}
                                onChange={handleChange}
                                placeholder="e.g. finance, quarterly, report"
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Application Creator</label>
                            <input
                                type="text"
                                name="creator"
                                value={metadata.creator}
                                onChange={handleChange}
                                placeholder="e.g. PDF Toolkit Studio"
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">PDF Producer</label>
                            <input
                                type="text"
                                name="producer"
                                value={metadata.producer}
                                onChange={handleChange}
                                placeholder="e.g. PDF Toolkit Engine"
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleSave}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <Save className="h-4 w-4" />
                {status.type === 'loading' ? 'Saving Metadata...' : 'Save Updated Properties & Download'}
            </button>
        </div>
    );
};

export default MetadataPdfTool;
