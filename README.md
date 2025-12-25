# PDF-Flow v2.0

A serverless PDF and Image manipulation tool optimized for Vercel deployment.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  React Frontend │────▶│  Vercel Blob     │────▶│ Serverless API  │
│  (Vite + TW)    │     │  (File Storage)  │     │ (Node.js)       │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  CloudConvert   │
                                                │  (Office Conv)  │
                                                └─────────────────┘
```

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Dropzone** for file uploads
- **@vercel/blob** for direct uploads

### Backend (Serverless)
- **Vercel Serverless Functions**
- **pdf-lib** for PDF manipulation
- **sharp** for image processing
- **cloudconvert** for Office conversions
- **@vercel/blob** for file storage

## Features

### PDF Suite
| Feature | Processing | Description |
|---------|------------|-------------|
| Merge | Server-side (pdf-lib) | Combine multiple PDFs |
| Split | Server-side (pdf-lib) | Extract pages |
| Compress | Server-side (pdf-lib) | Reduce file size |
| Rotate | Server-side (pdf-lib) | Rotate pages |
| Watermark | Server-side (pdf-lib) | Add text watermark |
| PDF → DOCX | CloudConvert API | Convert to Word |
| PDF → PPTX | CloudConvert API | Convert to PowerPoint |
| DOCX → PDF | CloudConvert API | Convert from Word |
| PPTX → PDF | CloudConvert API | Convert from PowerPoint |

### Image Suite
| Feature | Processing | Description |
|---------|------------|-------------|
| Compress | Server-side (sharp) | Reduce file size |
| Upscale | Server-side (sharp) | 2x/4x upscaling |
| Resize | Server-side (sharp) | Change dimensions |
| Convert | Server-side (sharp) | Format conversion |

## Project Structure

```
pdf-flow/
├── api/                    # Vercel Serverless Functions
│   ├── lib/
│   │   ├── blob-utils.js   # Vercel Blob helpers
│   │   ├── cloudconvert.js # CloudConvert integration
│   │   ├── image-utils.js  # Image processing (sharp)
│   │   └── pdf-utils.js    # PDF processing (pdf-lib)
│   ├── pdf/
│   │   ├── merge.js
│   │   ├── split.js
│   │   ├── compress.js
│   │   ├── rotate.js
│   │   └── watermark.js
│   ├── image/
│   │   ├── compress.js
│   │   ├── convert.js
│   │   ├── resize.js
│   │   └── upscale.js
│   ├── convert.js          # CloudConvert endpoint
│   ├── upload.js           # File upload endpoint
│   └── health.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── vercel.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Vercel account
- Vercel Blob storage enabled
- (Optional) CloudConvert API key for Office conversions

### Environment Variables

Create a `.env` file or set these in Vercel:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key  # Optional
```

### Local Development

1. Install dependencies:
```bash
npm run install:all
```

2. Run the development server:
```bash
npm run dev
```

3. Open http://localhost:5173

### Deploy to Vercel

#### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/pdf-flow.git
   git push -u origin main
   ```

2. **Import in Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects the configuration from `vercel.json`

3. **Set Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   | Variable | Required | Description |
   |----------|----------|-------------|
   | `BLOB_READ_WRITE_TOKEN` | ✅ Yes | Get from Vercel Blob storage |
   | `CLOUDCONVERT_API_KEY` | ❌ Optional | For Office conversions |

4. **Enable Vercel Blob Storage**
   - Go to Storage → Create → Blob
   - Copy the `BLOB_READ_WRITE_TOKEN`

5. **Deploy!**

#### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Then set environment variables in the dashboard.

## API Reference

### PDF Endpoints

#### POST `/api/pdf/merge`
Merge multiple PDFs.
```json
{
  "urls": ["https://blob.url/file1.pdf", "https://blob.url/file2.pdf"]
}
```

#### POST `/api/pdf/split`
Split PDF into pages.
```json
{
  "url": "https://blob.url/file.pdf",
  "ranges": "1-3,5,7-10"  // Optional
}
```

#### POST `/api/pdf/compress`
Compress PDF.
```json
{
  "url": "https://blob.url/file.pdf"
}
```

#### POST `/api/pdf/rotate`
Rotate PDF pages.
```json
{
  "url": "https://blob.url/file.pdf",
  "angle": 90,
  "pages": "all"  // or "1,3,5"
}
```

#### POST `/api/pdf/watermark`
Add watermark.
```json
{
  "url": "https://blob.url/file.pdf",
  "text": "CONFIDENTIAL",
  "opacity": 0.3,
  "fontSize": 50,
  "color": "#888888"
}
```

### Conversion Endpoints

#### POST `/api/convert`
Start conversion job.
```json
{
  "url": "https://blob.url/file.pdf",
  "type": "pdf-to-docx"  // pdf-to-docx, pdf-to-pptx, docx-to-pdf, pptx-to-pdf
}
```

#### GET `/api/convert?jobId=xxx`
Poll conversion status.

### Image Endpoints

#### POST `/api/image/compress`
Compress image.
```json
{
  "url": "https://blob.url/image.jpg",
  "quality": 80,
  "format": "webp"
}
```

#### POST `/api/image/upscale`
Upscale image.
```json
{
  "url": "https://blob.url/image.jpg",
  "scale": 2  // 2 or 4
}
```

#### POST `/api/image/resize`
Resize image.
```json
{
  "url": "https://blob.url/image.jpg",
  "width": 800,
  "height": 600,
  "fit": "cover"
}
```

#### POST `/api/image/convert`
Convert image format.
```json
{
  "url": "https://blob.url/image.jpg",
  "format": "webp",
  "quality": 90
}
```

## Limitations

- **File Size**: 100MB max (Vercel Blob limit)
- **Function Timeout**: 60 seconds max
- **Memory**: 1024MB for serverless functions
- **No WebSockets**: Uses polling for progress

## License

MIT
# OptiNexus
