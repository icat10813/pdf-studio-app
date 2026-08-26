import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Eye, EyeOff } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * Unlock PDF Tool: Removes password protection from a PDF
 */
export const UnlockPdfTool = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    const handleUnlock = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Decrypting PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            
            const pdfDoc = await PDFDocument.load(pdfBytes, {
                userPassword: password,
            });
            
            const unlockedPdfBytes = await pdfDoc.save();
            const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `unlocked_${file.name}`);
            setStatus({ type: 'success', message: 'PDF unlocked and saved successfully without restrictions!' });
        } catch (e) {
            if (e.name === 'EncryptedPDFError' || e.message?.toLowerCase().includes('password')) {
                setStatus({ type: 'error', message: 'Unlock failed: Password is incorrect or required.' });
            } else {
                setStatus({ type: 'error', message: `An error occurred: ${e.message}` });
            }
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a protected PDF to unlock"}
            />

            {file && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label htmlFor="password-unlock" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password (if any)
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password-unlock"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password (or leave blank if none)"
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
                onClick={handleUnlock}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {status.type === 'loading' ? 'Decrypting...' : 'Remove Password & Save PDF'}
            </button>
        </div>
    );
};

export default UnlockPdfTool;
