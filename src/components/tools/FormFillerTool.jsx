import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { CheckSquare, Save, Edit3, HelpCircle } from 'lucide-react';
import FileUploader from '../common/FileUploader.jsx';
import MessageBox from '../common/MessageBox.jsx';

/**
 * PDF Form Filler Tool (Inspects and populates interactive AcroForm fields)
 */
export const FormFillerTool = () => {
    const [file, setFile] = useState(null);
    const [fields, setFields] = useState([]); // [{ name, type, value, isChecked, options }]
    const [formData, setFormData] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });

    const onDrop = useCallback(async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        setFile(selected);
        setStatus({ type: 'loading', message: 'Scanning interactive form fields...' });
        setFields([]);
        setFormData({});

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await selected.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            let form = null;
            try {
                form = pdfDoc.getForm();
            } catch (e) {
                // No form
            }

            if (!form || form.getFields().length === 0) {
                setStatus({
                    type: 'info',
                    message: 'No interactive AcroForm fields detected in this PDF. You can use the "Sign PDF" or "Edit PDF" tools to stamp text and annotations onto any standard document.'
                });
                return;
            }

            const detectedFields = form.getFields().map(f => {
                const name = f.getName();
                const constructorName = f.constructor.name;
                let type = 'text';
                let isChecked = false;
                let textValue = '';

                if (constructorName.includes('CheckBox')) {
                    type = 'checkbox';
                    try { isChecked = f.isChecked(); } catch (_) {}
                } else if (constructorName.includes('Dropdown') || constructorName.includes('OptionList')) {
                    type = 'dropdown';
                    try { textValue = f.getSelected() || ''; } catch (_) {}
                } else if (constructorName.includes('RadioGroup')) {
                    type = 'radio';
                    try { textValue = f.getSelected() || ''; } catch (_) {}
                } else {
                    type = 'text';
                    try { textValue = f.getText() || ''; } catch (_) {}
                }

                return {
                    name,
                    type,
                    value: textValue,
                    isChecked
                };
            });

            setFields(detectedFields);
            const initialData = {};
            detectedFields.forEach(f => {
                initialData[f.name] = f.type === 'checkbox' ? f.isChecked : f.value;
            });
            setFormData(initialData);

            setStatus({ 
                type: 'success', 
                message: `Found ${detectedFields.length} interactive form field(s) in this document.` 
            });

        } catch (e) {
            setStatus({ type: 'error', message: `Form inspection error: ${e.message}` });
        }
    }, []);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveForm = async () => {
        if (!file) return;
        setStatus({ type: 'loading', message: 'Filling form fields & saving PDF...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const form = pdfDoc.getForm();

            for (const f of fields) {
                const currentVal = formData[f.name];
                try {
                    if (f.type === 'checkbox') {
                        const checkField = form.getCheckBox(f.name);
                        if (currentVal) checkField.check();
                        else checkField.uncheck();
                    } else if (f.type === 'text') {
                        const textField = form.getTextField(f.name);
                        textField.setText(String(currentVal || ''));
                    } else if (f.type === 'dropdown') {
                        const dropdownField = form.getDropdown(f.name);
                        if (currentVal) dropdownField.select(currentVal);
                    }
                } catch (fieldErr) {
                    console.warn(`Could not set field ${f.name}:`, fieldErr);
                }
            }

            const filledBytes = await pdfDoc.save();
            saveAs(new Blob([filledBytes], { type: 'application/pdf' }), `filled_${file.name}`);
            setStatus({ type: 'success', message: 'Form fields successfully populated! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `Failed to fill form: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop an interactive PDF form to fill fields"}
            />

            <MessageBox type={status.type} message={status.message} />

            {fields.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-blue-600" />
                        Interactive Form Fields ({fields.length})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map(f => (
                            <div key={f.name} className="p-3 bg-white border border-gray-200 rounded-xl">
                                <label className="block text-xs font-semibold text-gray-700 mb-1 truncate" title={f.name}>
                                    {f.name}
                                </label>

                                {f.type === 'checkbox' ? (
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={!!formData[f.name]}
                                            onChange={e => handleInputChange(f.name, e.target.checked)}
                                            className="rounded text-blue-600 h-4 w-4"
                                        />
                                        <span className="text-xs text-gray-600 font-medium">Checked</span>
                                    </label>
                                ) : (
                                    <input
                                        type="text"
                                        value={formData[f.name] || ''}
                                        onChange={e => handleInputChange(f.name, e.target.value)}
                                        placeholder={`Enter ${f.name}`}
                                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSaveForm}
                        disabled={status.type === 'loading'}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {status.type === 'loading' ? 'Populating Document...' : 'Fill Form & Download PDF'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FormFillerTool;
