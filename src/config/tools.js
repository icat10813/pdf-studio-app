import {
    Merge,
    Split,
    FileArchive,
    FileType,
    FileImage,
    Edit,
    ScanText,
    Signature as SignatureIcon,
    Droplet,
    RotateCcw,
    Replace,
    Lock,
    Unlock,
    Braces,
    GitCompareArrows,
    Crop,
    ListOrdered,
    FileText,
    Info,
    Zap,
    Code,
    ShieldAlert,
    Printer,
    Moon,
    Layers,
    Wrench,
    AlignLeft,
    Grid,
    Edit3,
    Image as ImageIcon
} from 'lucide-react';

import MergeTool from '../components/tools/MergeTool.jsx';
import SplitTool from '../components/tools/SplitTool.jsx';
import OrganizePdfTool from '../components/tools/OrganizePdfTool.jsx';
import RotatePdfTool from '../components/tools/RotatePdfTool.jsx';
import CropPdfTool from '../components/tools/CropPdfTool.jsx';
import PageNumberTool from '../components/tools/PageNumberTool.jsx';
import NUpPdfTool from '../components/tools/NUpPdfTool.jsx';

import PdfToJpgTool from '../components/tools/PdfToJpgTool.jsx';
import PdfToPngTool from '../components/tools/PdfToPngTool.jsx';
import JpgToPdfTool from '../components/tools/JpgToPdfTool.jsx';
import PngToPdfTool from '../components/tools/PngToPdfTool.jsx';
import HtmlToPdfTool from '../components/tools/HtmlToPdfTool.jsx';
import PdfToDocxTool from '../components/tools/PdfToDocxTool.jsx';
import CompressPdfTool from '../components/tools/CompressPdfTool.jsx';
import ExtractTextTool from '../components/tools/ExtractTextTool.jsx';
import ExtractImagesTool from '../components/tools/ExtractImagesTool.jsx';

import SignPdfTool from '../components/tools/SignPdfTool.jsx';
import WatermarkTool from '../components/tools/WatermarkTool.jsx';
import RedactPdfTool from '../components/tools/RedactPdfTool.jsx';
import FlattenPdfTool from '../components/tools/FlattenPdfTool.jsx';
import ProtectPdfTool from '../components/tools/ProtectPdfTool.jsx';
import UnlockPdfTool from '../components/tools/UnlockPdfTool.jsx';
import MetadataPdfTool from '../components/tools/MetadataPdfTool.jsx';
import FormFillerTool from '../components/tools/FormFillerTool.jsx';
import HeaderFooterTool from '../components/tools/HeaderFooterTool.jsx';

import OcrPdfTool from '../components/tools/OcrPdfTool.jsx';
import ComparePdfTool from '../components/tools/ComparePdfTool.jsx';
import EditPdfTool from '../components/tools/EditPdfTool.jsx';
import GrayscalePdfTool from '../components/tools/GrayscalePdfTool.jsx';
import InvertPdfTool from '../components/tools/InvertPdfTool.jsx';
import RepairPdfTool from '../components/tools/RepairPdfTool.jsx';

export const tools = [
    // ==================== 1. ORGANIZE & MANAGE ====================
    { 
        name: 'Merge PDF', 
        slug: 'merge', 
        category: 'organize',
        badge: 'Popular',
        badgeColor: 'blue',
        icon: Merge, 
        component: MergeTool, 
        description: 'Combine multiple PDF files into a single unified document with custom drag reordering.' 
    },
    { 
        name: 'Split PDF', 
        slug: 'split', 
        category: 'organize',
        badge: 'Visual Pick',
        badgeColor: 'blue',
        icon: Split, 
        component: SplitTool, 
        description: 'Extract specific pages or custom ranges using interactive visual thumbnail pickers.' 
    },
    { 
        name: 'Organize PDF', 
        slug: 'organize', 
        category: 'organize',
        badge: 'Studio',
        badgeColor: 'purple',
        icon: Replace, 
        component: OrganizePdfTool, 
        description: 'Rearrange, rotate (90°), duplicate, delete, and reverse pages with visual thumbnail cards.' 
    },
    { 
        name: 'Rotate PDF', 
        slug: 'rotate', 
        category: 'organize',
        icon: RotateCcw, 
        component: RotatePdfTool, 
        description: 'Rotate all or specific PDF pages by 90°, 180°, or 270° with 1-click batch controls.' 
    },
    { 
        name: 'Crop PDF', 
        slug: 'crop', 
        category: 'organize',
        icon: Crop, 
        component: CropPdfTool, 
        description: 'Trim page margins and adjust visible dimensions with point-precision margins.' 
    },
    { 
        name: 'Page Numbers', 
        slug: 'page-numbers', 
        category: 'organize',
        icon: ListOrdered, 
        component: PageNumberTool, 
        description: 'Add numbered pagination headers or footers with custom offsets and live visual preview.' 
    },
    { 
        name: 'N-Up Handouts', 
        slug: 'n-up', 
        category: 'organize',
        badge: 'Print Ready',
        badgeColor: 'emerald',
        icon: Grid, 
        component: NUpPdfTool, 
        description: 'Arrange 2, 4, or 6 pages per physical sheet for compact printable booklets and handouts.' 
    },

    // ==================== 2. CONVERT & EXPORT ====================
    { 
        name: 'Compress PDF', 
        slug: 'compress', 
        category: 'convert',
        badge: 'Client-Side',
        badgeColor: 'amber',
        icon: Zap, 
        component: CompressPdfTool, 
        description: 'Reduce file size and optimize image streams directly in your browser with zero data loss.' 
    },
    { 
        name: 'HTML to PDF', 
        slug: 'html-to-pdf', 
        category: 'convert',
        badge: 'Rich Editor',
        badgeColor: 'indigo',
        icon: Code, 
        component: HtmlToPdfTool, 
        description: 'Render and compile rich HTML, CSS, invoices, and templates into clean PDF documents.' 
    },
    { 
        name: 'PDF to Word (.DOC)', 
        slug: 'pdf-to-docx', 
        category: 'convert',
        badge: 'Editable',
        badgeColor: 'blue',
        icon: FileType, 
        component: PdfToDocxTool, 
        description: 'Convert PDF files into formatted Word documents (.doc) and structured Markdown.' 
    },
    { 
        name: 'PDF to JPG', 
        slug: 'pdf-to-jpg', 
        category: 'convert',
        badge: 'High-Res',
        badgeColor: 'emerald',
        icon: FileImage, 
        component: PdfToJpgTool, 
        description: 'Convert PDF pages into high-resolution JPG images with selectable DPI quality.' 
    },
    { 
        name: 'PDF to PNG', 
        slug: 'pdf-to-png', 
        category: 'convert',
        icon: FileImage, 
        component: PdfToPngTool, 
        description: 'Export PDF pages to transparent, lossless high-definition PNG images.' 
    },
    { 
        name: 'JPG to PDF', 
        slug: 'jpg-to-pdf', 
        category: 'convert',
        icon: FileType, 
        component: JpgToPdfTool, 
        description: 'Convert JPG or JPEG images into a clean, uniform PDF document.' 
    },
    { 
        name: 'PNG to PDF', 
        slug: 'png-to-pdf', 
        category: 'convert',
        icon: FileType, 
        component: PngToPdfTool, 
        description: 'Compile multiple transparent PNG images into a standard A4 or auto-sized PDF.' 
    },
    { 
        name: 'Extract Text', 
        slug: 'extract-text', 
        category: 'convert',
        badge: 'Instant',
        badgeColor: 'teal',
        icon: FileText, 
        component: ExtractTextTool, 
        description: 'Extract raw text from PDF documents instantly with zero API requirements.' 
    },
    { 
        name: 'Extract Images', 
        slug: 'extract-images', 
        category: 'convert',
        badge: 'Assets',
        badgeColor: 'cyan',
        icon: ImageIcon, 
        component: ExtractImagesTool, 
        description: 'Scan and extract all high-resolution images embedded across PDF document pages.' 
    },

    // ==================== 3. SECURITY & SIGN STUDIO ====================
    { 
        name: 'Sign PDF', 
        slug: 'sign', 
        category: 'security',
        badge: 'Interactive',
        badgeColor: 'indigo',
        icon: SignatureIcon, 
        component: SignPdfTool, 
        description: 'Draw handwritten signatures, type cursive scripts, and stamp approval badges interactively.' 
    },
    { 
        name: 'Redact & Blackout', 
        slug: 'redact', 
        category: 'security',
        badge: 'Permanent',
        badgeColor: 'rose',
        icon: ShieldAlert, 
        component: RedactPdfTool, 
        description: 'Draw opaque blackout redactions over confidential numbers, names, or sensitive text.' 
    },
    { 
        name: 'Watermark PDF', 
        slug: 'watermark', 
        category: 'security',
        badge: 'Live Preview',
        badgeColor: 'cyan',
        icon: Droplet, 
        component: WatermarkTool, 
        description: 'Stamp custom text watermarks with real-time opacity, color, and angle preview.' 
    },
    { 
        name: 'Header & Footer', 
        slug: 'header-footer', 
        category: 'security',
        icon: AlignLeft, 
        component: HeaderFooterTool, 
        description: 'Insert dynamic headers and footers with title, date, and page numbering macro tags.' 
    },
    { 
        name: 'Flatten PDF', 
        slug: 'flatten', 
        category: 'security',
        badge: 'Tamper-Proof',
        badgeColor: 'emerald',
        icon: Layers, 
        component: FlattenPdfTool, 
        description: 'Fuse interactive form fields, annotations, and visual layers into static un-editable pages.' 
    },
    { 
        name: 'PDF Form Filler', 
        slug: 'form-filler', 
        category: 'security',
        icon: Edit3, 
        component: FormFillerTool, 
        description: 'Inspect and populate interactive AcroForm text fields, checkboxes, and dropdowns.' 
    },
    { 
        name: 'Protect PDF', 
        slug: 'protect', 
        category: 'security',
        icon: Lock, 
        component: ProtectPdfTool, 
        description: 'Encrypt your PDF with standard AES password protection to restrict viewing.' 
    },
    { 
        name: 'Unlock PDF', 
        slug: 'unlock', 
        category: 'security',
        icon: Unlock, 
        component: UnlockPdfTool, 
        description: 'Remove password protection from encrypted PDF documents.' 
    },
    { 
        name: 'PDF Properties', 
        slug: 'metadata', 
        category: 'security',
        icon: Info, 
        component: MetadataPdfTool, 
        description: 'Inspect and edit document title, author, subject, keywords, creator, and producer.' 
    },

    // ==================== 4. AI & SMART UTILITIES ====================
    { 
        name: 'OCR PDF', 
        slug: 'ocr', 
        category: 'ai',
        badge: 'Gemini 2.0 AI',
        badgeColor: 'violet',
        icon: ScanText, 
        component: OcrPdfTool, 
        description: 'Extract and structure text from scanned PDFs and document images using Gemini AI.' 
    },
    { 
        name: 'Compare PDF', 
        slug: 'compare', 
        category: 'ai',
        badge: 'Pixel Diff',
        badgeColor: 'rose',
        icon: GitCompareArrows, 
        component: ComparePdfTool, 
        description: 'Visually compare two PDF versions and highlight pixel discrepancies with Pixelmatch.' 
    },
    { 
        name: 'Edit PDF', 
        slug: 'edit', 
        category: 'ai',
        icon: Edit, 
        component: EditPdfTool, 
        description: 'Add text annotations and custom labels directly to PDF pages at exact coordinates.' 
    },
    { 
        name: 'Grayscale PDF', 
        slug: 'grayscale', 
        category: 'ai',
        badge: 'Ink Saver',
        badgeColor: 'gray',
        icon: Printer, 
        component: GrayscalePdfTool, 
        description: 'Convert color documents into clean monochrome/grayscale for ink saving and print.' 
    },
    { 
        name: 'Dark Mode Invert', 
        slug: 'invert', 
        category: 'ai',
        badge: 'Night Reader',
        badgeColor: 'indigo',
        icon: Moon, 
        component: InvertPdfTool, 
        description: 'Invert color channels into high-contrast dark mode for comfortable night reading.' 
    },
    { 
        name: 'Repair PDF', 
        slug: 'repair', 
        category: 'ai',
        badge: 'Recovery',
        badgeColor: 'amber',
        icon: Wrench, 
        component: RepairPdfTool, 
        description: 'Reconstruct broken byte streams, fix trailer dictionaries, and rebuild xref tables.' 
    },
];

export default tools;
