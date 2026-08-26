import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Eye, EyeOff } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * Protect PDF Tool: Adds password encryption to a PDF
 */
export const ProtectPdfTool = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleProtect = async () => {
        if (!file || !password) {
            setStatus({ type: 'error', message: 'Please select a file and enter a password.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Encrypting and protecting PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);

            pdfDoc.setProducer('PDF Toolkit');
            pdfDoc.setCreator('PDF Toolkit');

            const protectedPdfBytes = await pdfDoc.save({ 
                useObjectStreams: false,
                userPassword: password,
            });

            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `protected_${file.name}`);
            setStatus({ type: 'success', message: 'PDF password protection enabled successfully!' });
        } catch (e) {
            setStatus({ type: 'error', message: `Encryption failed: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to password protect"}
            />

            {file && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label htmlFor="password-protect" className="block text-sm font-medium text-gray-700 mb-1">
                        Set Document Open Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password-protect"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter secure password"
                            className="block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            )}

            <MessageBox type={status.type} message={status.message} />

            <button
                onClick={handleProtect}
                disabled={!file || !password || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {status.type === 'loading' ? 'Encrypting Document...' : 'Encrypt & Download Protected PDF'}
            </button>
        </div>
    );
};

export default ProtectPdfTool;
