# 📄 PDF Toolkit — World-Class, Private, Client-Side PDF Utilities

<p align="center">
  <a href="https://yashdhanani.github.io/pdf-toolkit-app/">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github" alt="Live Demo" />
  </a>
  <a href="https://www.buymeacoffee.com/dhananiyash">
    <img src="https://img.shields.io/badge/☕%20Buy%20Me%20A%20Coffee-dhananiyash-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  <img src="https://img.shields.io/badge/🔒%20Privacy-100%25%20Client--Side-emerald?style=for-the-badge" alt="100% Client-Side Privacy" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License" />
</p>

---

## ✨ Overview

**PDF Toolkit** is an ultra-fast, privacy-first, client-side PDF workspace offering **31 comprehensive tools** for viewing, editing, converting, organizing, signing, and securing documents directly in your browser.

All processing occurs **100% locally inside your browser** using WebAssembly, Web Workers, and modern Canvas/SVG engines. **Your sensitive documents never touch an external server.**

🌐 **Live Web App**: [**https://yashdhanani.github.io/pdf-toolkit-app/**](https://yashdhanani.github.io/pdf-toolkit-app/)

---

## 🌟 Key Highlights & Engineering Features

- 🔒 **100% Private & Serverless**: Zero file uploads. All PDF parsing, rasterization, rendering, and modifications happen purely in memory on the client.
- 📐 **Persistent Vector SVG Architecture**: Annotations, shapes, and highlights live on a dedicated vector overlay layer — they never flicker, never disappear on scroll, and remain crisp at any screen zoom.
- ✍️ **Calligraphic Sign & Stamp Studio**:
  - **3 Signature Modes**: Draw handwritten signatures, type authentic cursive calligraphy (Great Vibes, Alex Brush, Caveat, Dancing Script, Sacramento, Satisfy), or upload image stamps.
  - **4 High-Contrast Corner Resize Anchors**: Drag Royal Blue circular handles to smoothly resize signatures with proportional aspect ratio preservation.
  - **Dynamic Text & Font Scaling**: Badge text and signature images smoothly scale up or down proportionally with the box.
  - **100% Borderless Placement**: Clean transparent background when placed on the document, looking exactly like real ink on paper.
- 🖍️ **Authentic Broad Highlighter Studio**:
  - **$24\text{px}$ Text-Covering Marker Bar**: Full-height marker stroke with clean square line ends.
  - **3 Sizing Presets**: `Thin (14px)`, `Regular (24px)`, and `Thick (36px)`.
  - **3 Opacity Tones**: `Light (35%)`, `Medium (55%)`, and `Dark (80%)` across 6 vibrant colors.
  - **Smart Straight-Snap**: Locks straight horizontally across text lines (Hold `Shift` to toggle anytime).
- 💧 **Moveable Watermark Studio**: Click and drag watermarks anywhere on the live canvas with real-time coordinate feedback (`X% • Y%`) and 9-Grid quick presets.
- 📱 **Continuous Multi-Page Stream Viewer**: Seamlessly scroll through multi-page PDFs with virtual windowing, auto-fitting to mobile, tablet, and desktop screens.
- ⌨️ **Power-User Keyboard Shortcuts**:
  - `⌘K` / `Ctrl+K`: Global Spotlight Command Palette.
  - `⌘Z` / `Ctrl+Z`: Multi-level Undo.
  - `⌘Y` / `Ctrl+Y`: Redo.
  - `Delete` / `Backspace`: Remove selected annotations.
  - `Escape`: Deselect active items.

---

## 🛠️ Complete Suite of 31 Tools

### 📑 1. Organize & Manage
1. **Merge PDF** — Combine multiple PDF files with drag-and-drop page reordering and size previews.
2. **Split PDF** — Extract specific pages or custom ranges with interactive thumbnail pickers.
3. **Organize PDF** — Reorder, rotate ($90^\circ$), duplicate, delete, and reverse pages visually.
4. **Rotate PDF** — 1-click batch rotate all pages or individual page orientation ($90^\circ, 180^\circ, 270^\circ$).
5. **Crop PDF** — Trim page margins with point precision across all document pages.
6. **Page Numbers** — Insert custom formatted page numbers with 6 alignment positions and cover-page skipping.
7. **N-Up Handouts** — Layout 2, 4, or 6 pages per physical sheet for compact booklets and printouts.
8. **Flatten PDF** — Fuse interactive form fields, annotations, and visual layers into static un-editable pages.
9. **Repair & Rebuild** — Reconstruct damaged byte streams, fix cross-reference tables, and repair corrupt PDFs.

### 🔄 2. Convert & Transform
10. **Compress PDF** — True client-side image stream optimization with multiple compression tiers.
11. **PDF to JPG** — Export pages to high-DPI JPG images with customizable quality up to 300 DPI.
12. **PDF to PNG** — Export PDF pages to lossless, transparent high-definition PNG images.
13. **JPG to PDF** — Convert batches of JPG/JPEG photos into clean, standardized PDF documents.
14. **PNG to PDF** — Compile transparent PNG graphics into standard A4 or auto-fitted PDFs.
15. **PDF to Word (.DOC)** — Convert PDF files into editable Word documents (`.doc`) and Markdown (`.md`).
16. **HTML to PDF** — Render HTML, CSS, invoice templates, and web code into downloadable PDFs.
17. **Extract Images** — Deep-scan and extract all embedded high-resolution photos and figures.
18. **Extract Text** — Instant text extraction with 1-click copy and `.txt` file export.

### ✏️ 3. Edit & Annotate
19. **Edit PDF Studio** — Multi-page live editor with circles, boxes, arrows, freehand drawings, straight highlighters, and draggable text notes (`⠿`).
20. **Sign & Stamp PDF** — Place authentic cursive signatures, drawn signatures, date badges, and approval stamps with 4-corner resizing.
21. **Watermark PDF** — Add moveable text watermarks with live canvas dragging, 9-grid presets, opacity, rotation, and multi-page range filters.
22. **Redact & Blackout** — Draw permanent blackout redactions over confidential data and sensitive text.
23. **Header & Footer** — Insert headers and footers with dynamic macros (`{page}`, `{total}`, `{date}`, `{title}`).
24. **PDF Form Filler** — Inspect and populate interactive AcroForm text fields, checkboxes, and radio buttons.
25. **Compare PDF** — Visually compare two PDF versions and highlight pixel discrepancies with Pixelmatch.

### 🔒 4. Security & Optimization
26. **Protect PDF** — Encrypt PDF documents with standard AES password protection.
27. **Unlock PDF** — Decrypt password-protected PDFs for unrestricted viewing and printing.
28. **Metadata Editor** — Inspect and edit document title, author, subject, keywords, creator, and producer tags.
29. **Grayscale PDF** — Convert colorful documents to clean monochrome grayscale for ink saving.
30. **Invert Colors (Dark Mode)** — Invert color channels for comfortable night reading and high contrast.
31. **OCR PDF (Gemini AI)** — Extract and structure text from scanned PDFs and photos using Google Gemini Vision API.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) |
| **Bundler & Dev Server** | [Vite 7](https://vitejs.dev/) |
| **Styling & CSS** | [UnoCSS](https://unocss.dev/) (Utility-First CSS engine with Tailwind preset) |
| **PDF Manipulation** | [PDF-Lib](https://pdf-lib.js.org/) & [PDF.js](https://mozilla.github.io/pdf.js/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **File I/O** | [React Dropzone](https://react-dropzone.js.org/) & [FileSaver.js](https://github.com/eligrey/FileSaver.js/) |
| **Diffing Engine** | [Pixelmatch](https://github.com/mapbox/pixelmatch) |
| **Deployment** | [GitHub Pages](https://pages.github.com/) via GitHub Actions |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yashdhanani/pdf-toolkit-app.git
   cd pdf-toolkit-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/pdf-toolkit-app/` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## 🚢 Deployment to GitHub Pages

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) configured for zero-config automatic deployment:

1. Push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "Deploy PDF Toolkit"
   git push origin main
   ```
2. In your GitHub repository settings, navigate to **Settings > Pages** and ensure **Source** is set to **GitHub Actions**.
3. Your application will be live at:
   `https://yashdhanani.github.io/pdf-toolkit-app/`

---

## 👤 Author & Support

Developed by **Yash Dhanani**

- 🐙 **GitHub**: [@yashdhanani](https://github.com/yashdhanani)
- ☕ **Support the Project**: If you find this toolkit helpful, consider buying me a coffee:
  <br>
  <a href="https://www.buymeacoffee.com/dhananiyash">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=dhananiyash&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me A Coffee" />
  </a>

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
