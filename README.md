# OptiNexus

> **A hub for optimizing every digital asset you own.**

A modern, serverless PDF and Image manipulation tool with a beautiful UI, optimized for Vercel deployment.

![OptiNexus](https://img.shields.io/badge/OptiNexus-Digital%20Asset%20Optimization-83a02c?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000?style=flat-square&logo=vercel)

## ✨ Features

### 📄 PDF Suite
| Feature | Description |
|---------|-------------|
| **Merge** | Combine multiple PDFs into one |
| **Split** | Extract specific pages or ranges |
| **Compress** | Reduce file size while maintaining quality |
| **Rotate** | Rotate pages by 90°, 180°, or 270° |
| **Watermark** | Add customizable text watermarks |
| **PDF → DOCX** | Convert PDF to editable Word document |
| **PDF → PPTX** | Convert PDF to PowerPoint presentation |
| **DOCX → PDF** | Convert Word documents to PDF |
| **PPTX → PDF** | Convert PowerPoint to PDF |

### 🖼️ Image Suite
| Feature | Description |
|---------|-------------|
| **Compress** | Reduce image file size with quality control |
| **Upscale** | 2x or 4x AI-powered upscaling |
| **Resize** | Change dimensions with various fit options |
| **Convert** | Convert between PNG, JPG, WebP, AVIF |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ File Upload │  │ Tool Cards  │  │ Job Tracker │  │ Downloads  │  │
│  │ (Dropzone)  │  │ (Workspace) │  │ (Progress)  │  │            │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Vercel Serverless Functions                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ /api/pdf │  │/api/image│  │/api/conv │  │ /api/upload|download │ │
│  │ (pdf-lib)│  │ (sharp)  │  │(CloudConv)│ │   (Blob Storage)     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** with custom design system
- **Google Fonts** - Exo 2 (display) + Inter (body)
- **Lucide React** for icons
- **React Dropzone** for drag-and-drop uploads
- **Axios** for API communication

### Backend (Serverless)
- **Vercel Serverless Functions** (Node.js)
- **pdf-lib** for PDF manipulation
- **sharp** for image processing
- **CloudConvert API** for Office conversions
- **Vercel Blob** for production file storage
- **Multer** for local development uploads

### Design System
A nature-inspired color palette with excellent contrast:

| Color | Usage |
|-------|-------|
| **Ivory** (Brand) | Primary accent, buttons, highlights |
| **Dry Sage** | Secondary accent, hover states |
| **Ebony** (Surface) | Backgrounds, cards |
| **Dark Slate Grey** | Borders, subtle elements |
| **Dim Grey** (Muted) | Secondary text, icons |

## 📁 Project Structure

```
optinexus/
├── api/                      # Vercel Serverless Functions
│   ├── lib/
│   │   ├── blob-utils.js     # File storage utilities
│   │   ├── cloudconvert.js   # CloudConvert integration
│   │   ├── image-utils.js    # Image processing (sharp)
│   │   └── pdf-utils.js      # PDF processing (pdf-lib)
│   ├── pdf.js                # All PDF operations
│   ├── image.js              # All image operations
│   ├── convert.js            # CloudConvert endpoint
│   ├── upload.js             # File upload handler
│   ├── download.js           # File download handler
│   └── health.js             # Health check endpoint
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FileUploader.jsx
│   │   │   ├── ToolWorkspace.jsx
│   │   │   └── JobsPanel.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── uploads/                  # Local dev file storage (gitignored)
├── dev-server.js             # Local development API server
├── vercel.json               # Vercel deployment config
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **npm** or **yarn**
- **(Optional)** CloudConvert API key for Office conversions
- **(Production)** Vercel account with Blob storage

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required for Production (Vercel)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Optional - For Office document conversions
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key

# Optional - Password to protect CloudConvert features (default: optinexus2024)
CLOUDCONVERT_PASSWORD=your_secure_password_here

# Optional - File time-to-live in milliseconds (default: 30 minutes)
FILE_TTL_MS=1800000
```

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jindal07/OptiNexus.git
   cd OptiNexus
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   
   In one terminal (API server):
   ```bash
   npm run dev:api
   ```
   
   In another terminal (Frontend):
   ```bash
   cd frontend && npm run dev
   ```

4. **Open the app**
   Navigate to [http://localhost:5173](http://localhost:5173)

> **Note:** Local development uses file-based storage in the `uploads/` directory instead of Vercel Blob.

## 🌐 Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/optinexus.git
   git push -u origin main
   ```

2. **Import in Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects the configuration

3. **Enable Vercel Blob Storage**
   - Go to Storage → Create → Blob
   - Copy the `BLOB_READ_WRITE_TOKEN`

4. **Set Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   
   | Variable | Required | Description |
   |----------|----------|-------------|
   | `BLOB_READ_WRITE_TOKEN` | ✅ Yes | Vercel Blob storage token |
   | `CLOUDCONVERT_API_KEY` | ❌ Optional | For Office conversions |

5. **Deploy!**

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📡 API Reference

### PDF Operations

**POST `/api/pdf`**

All PDF operations use a single endpoint with an `action` parameter:

```javascript
// Merge PDFs
{ action: "merge", urls: ["url1.pdf", "url2.pdf"] }

// Split PDF
{ action: "split", url: "file.pdf", ranges: "1-3,5,7-10" }

// Compress PDF
{ action: "compress", url: "file.pdf" }

// Rotate PDF
{ action: "rotate", url: "file.pdf", angle: 90, pages: "all" }

// Add Watermark
{ action: "watermark", url: "file.pdf", text: "CONFIDENTIAL", opacity: 0.3, fontSize: 50 }
```

### Image Operations

**POST `/api/image`**

All image operations use a single endpoint with an `action` parameter:

```javascript
// Compress Image
{ action: "compress", url: "image.jpg", quality: 80, format: "webp" }

// Upscale Image
{ action: "upscale", url: "image.jpg", scale: 2 }

// Resize Image
{ action: "resize", url: "image.jpg", width: 800, height: 600, fit: "cover" }

// Convert Format
{ action: "convert", url: "image.jpg", format: "webp", quality: 90 }
```

### Document Conversions

**POST `/api/convert`**

```javascript
// PDF to DOCX/PPTX
{ url: "file.pdf", type: "pdf-to-docx" }
{ url: "file.pdf", type: "pdf-to-pptx" }

// DOCX/PPTX to PDF
{ url: "file.docx", type: "docx-to-pdf" }
{ url: "file.pptx", type: "pptx-to-pdf" }
```

**GET `/api/convert?jobId=xxx`** - Poll conversion status

### File Operations

**POST `/api/upload`** - Upload files  
**GET `/api/download?url=xxx&filename=yyy`** - Download processed files

### Password Protection

**POST `/api/verify-password`** - Verify password for CloudConvert features

CloudConvert features (PDF ↔ DOCX/PPTX conversions) are password protected. Users must enter the correct password before accessing these features.

- Password is stored in `CLOUDCONVERT_PASSWORD` environment variable
- Default password: `optinexus2024` (change in production!)
- Authentication persists for 24 hours in session storage
- Password modal appears automatically when accessing protected features

```json
{
  "password": "your_password_here"
}
```

## ⚠️ Limitations

| Limit | Value |
|-------|-------|
| Max File Size | 100MB |
| Function Timeout | 60 seconds |
| Memory | 1024MB |
| Serverless Functions | 12 max (Hobby plan) |

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Easy on the eyes with nature-inspired colors
- **Drag & Drop** - Easy file uploads
- **Real-time Progress** - Track processing status
- **Glass Morphism** - Modern frosted glass effects
- **Smooth Animations** - Polished micro-interactions

## 🔒 Privacy & Security

- **No permanent storage** - Files are processed and stored temporarily
- **Client-side uploads** - Direct to Vercel Blob
- **Stateless backend** - No database or user tracking

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/jindal07">jindal07</a>
</p>
