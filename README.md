# react-smart-file-preview

A React package for previewing browser-accessible files with intelligent MIME type detection using magic bytes.

## Features

- 🔍 **Smart MIME detection** - Magic bytes analysis with fallback to Content-Type headers and file extensions
- ⚡ **Performance-first** - Reads only minimal bytes needed for detection (default: 64 bytes)
- 🎨 **Built-in viewers** - Image, video, audio, and text viewers included
- 🔧 **Extensible** - Register custom viewers by MIME type or MIME family
- 🎣 **React hooks** - `useMimeType` hook for custom detection workflows
- 📦 **Zero dependencies** - Core package has no external dependencies
- 🌐 **Multiple sources** - Supports URLs (http://, https://, file://, blob:, data:), File, and Blob objects

## Installation

```bash
npm install react-smart-file-preview
```

## Quick Start

```tsx
import { FilePreview } from 'react-smart-file-preview';

function App() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file && <FilePreview source={file} />}
    </div>
  );
}
```

## Usage

### Basic Usage

Preview a file:

```tsx
import { FilePreview } from 'react-smart-file-preview';

<FilePreview source={file} />
```

Preview a URL:

```tsx
<FilePreview source="https://example.com/image.jpg" />
```

Preview a Blob:

```tsx
const blob = new Blob(['Hello world'], { type: 'text/plain' });
<FilePreview source={blob} />
```

### Custom Viewers

Register custom viewers by exact MIME type:

```tsx
import { FilePreview, ViewerComponentProps } from 'react-smart-file-preview';

function MyPdfViewer({ url }: ViewerComponentProps) {
  return <iframe src={url} style={{ width: '100%', height: '600px' }} />;
}

<FilePreview
  source={file}
  viewers={{
    byMimeType: {
      'application/pdf': MyPdfViewer,
    },
  }}
/>
```

Register viewers by MIME family:

```tsx
function MyImageViewer({ url }: ViewerComponentProps) {
  return <img src={url} alt="Custom preview" />;
}

<FilePreview
  source={file}
  viewers={{
    byFamily: {
      'image': MyImageViewer,
    },
  }}
/>
```

Custom fallback viewer:

```tsx
function MyFallbackViewer({ detection }: ViewerComponentProps) {
  return <div>Cannot preview {detection.mimeType}</div>;
}

<FilePreview
  source={file}
  viewers={{
    fallback: MyFallbackViewer,
  }}
/>
```

### Custom Loading and Error Components

```tsx
function MyLoading() {
  return <div>Loading...</div>;
}

function MyError({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}

<FilePreview
  source={file}
  loadingComponent={MyLoading}
  errorComponent={MyError}
/>
```

### Using the Detection Hook

```tsx
import { useMimeType } from 'react-smart-file-preview';

function FileInfo({ file }: { file: File }) {
  const { detection, loading, error } = useMimeType(file);

  if (loading) return <div>Detecting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>MIME type: {detection?.mimeType || 'unknown'}</p>
      <p>Family: {detection?.family || 'unknown'}</p>
      <p>Confidence: {detection?.confidence}</p>
      <p>Source: {detection?.source}</p>
      {detection?.overridden && (
        <p>
          Overrode: {detection.overridden.mimeType} from {detection.overridden.source}
        </p>
      )}
    </div>
  );
}
```

### Standalone MIME Detection

```tsx
import { detectMimeType } from 'react-smart-file-preview';

const result = await detectMimeType(file, {
  maxMagicLength: 64, // default: 64 bytes
  signal: abortController.signal,
});

console.log(result.mimeType); // e.g., "image/jpeg"
console.log(result.confidence); // "high" | "medium" | "low"
console.log(result.source); // "magic-bytes" | "content-type-header" | "blob-type" | "file-extension" | "unknown"
```

## MIME Detection

### Detection Priority

The package uses a strict priority system for MIME type detection:

1. **Magic bytes** (highest confidence) - Binary signatures at the start of files
2. **Content-Type header** or `Blob.type` (medium confidence)
3. **File extension** (lowest confidence)

**Magic bytes always win.** A JPEG file named `file.txt` will be correctly detected as `image/jpeg`.

### Supported Magic Byte Formats

| Format | Magic Bytes | MIME Type |
|--------|-------------|-----------|
| JPEG | `FF D8 FF` | image/jpeg |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | image/png |
| GIF | `GIF87a` / `GIF89a` | image/gif |
| WebP | RIFF + WEBP marker | image/webp |
| PDF | `%PDF-` | application/pdf |
| MP4 | ftyp box at offset 4 | video/mp4 |
| WebM | EBML header | video/webm |
| OGG | `OggS` | audio/ogg |
| MP3 | ID3 tag or frame sync | audio/mpeg |
| WAV | RIFF + WAVE marker | audio/wav |
| ZIP | Valid ZIP signatures only | application/zip |

### ZIP Detection

⚠️ **Important:** ZIP files are detected using **valid ZIP signatures only**:

- `PK\x03\x04` (local file header)
- `PK\x05\x06` (end of central directory)
- `PK\x07\x08` (spanned archive)

A plain text file starting with "PKZIP.EXE is a tool..." will **NOT** be detected as a ZIP file because it doesn't have a valid ZIP signature.

### Text-Based Formats

Text-based formats are **NOT** detected by content heuristics. They must be detected through:

- MIME type (Content-Type header or Blob.type)
- File extension

This applies to:
- text/plain
- text/html
- application/json
- image/svg+xml
- text/markdown
- XML, YAML
- Source code files

### Detection Options

```tsx
type MimeDetectionOptions = {
  maxMagicLength?: number; // default: 64
  signal?: AbortSignal;
};
```

**maxMagicLength constraint:**
- Only reads the specified number of bytes for magic byte detection
- **Never** escalates to larger reads if detection fails
- Default: 64 bytes
- For URLs: uses Range requests when supported

## Built-in Viewers

### DefaultImageViewer
Renders images using `<img>` tag. Supports all image formats detected by MIME type.

### DefaultVideoViewer
Renders videos using `<video>` tag with controls.

### DefaultAudioViewer
Renders audio using `<audio>` tag with controls and a music icon.

### DefaultTextViewer
Renders text content with:
- 1MB size limit (truncates with warning)
- Syntax highlighting (coming in Milestone 2)
- Scrollable pre-formatted text

### DefaultFallbackViewer
Shows file information and provides:
- File name and size
- Detected MIME type
- Detection confidence and source
- "Open in new tab" button
- Download button

## API Reference

### `<FilePreview>`

Main component for previewing files.

**Props:**
```tsx
type FilePreviewProps = {
  source: string | File | Blob;
  viewers?: ViewerRegistry;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error }>;
  maxMagicLength?: number;
};
```

### `useMimeType()`

Hook for detecting MIME type.

```tsx
function useMimeType(
  source: FileSource | null,
  options?: { maxMagicLength?: number }
): {
  detection: MimeDetectionResult | null;
  loading: boolean;
  error: Error | null;
}
```

### `detectMimeType()`

Standalone MIME detection function.

```tsx
async function detectMimeType(
  source: FileSource,
  options?: MimeDetectionOptions
): Promise<MimeDetectionResult>
```

### `createViewerRegistry()`

Helper to create a viewer registry.

```tsx
function createViewerRegistry(
  config?: Partial<ViewerRegistry>
): ViewerRegistry
```

## Types

```tsx
type FileSource = string | File | Blob;

type MimeDetectionResult = {
  mimeType: string | null;
  family: string | null; // e.g., "image", "video"
  confidence: 'high' | 'medium' | 'low';
  source: 'magic-bytes' | 'content-type-header' | 'blob-type' | 'file-extension' | 'unknown';
  overridden?: {
    mimeType: string;
    source: string;
  };
};

type ViewerComponentProps = {
  source: FileSource;
  url: string; // Object URL for the file
  mimeType: string | null;
  detection: MimeDetectionResult;
};

type ViewerRegistry = {
  byMimeType?: Record<string, React.ComponentType<ViewerComponentProps>>;
  byFamily?: Record<string, React.ComponentType<ViewerComponentProps>>;
  fallback?: React.ComponentType<ViewerComponentProps>;
};
```

## Supported File Types (Milestone 1)

✅ Fully supported:

- **Images:** JPEG, PNG, GIF, WebP, SVG
- **Video:** MP4, WebM, OGG
- **Audio:** MP3, WAV, OGG
- **Text:** Plain text, JSON

## Limitations

⚠️ **Important limitations to be aware of:**

### CORS and Remote Files
- Remote URLs may be blocked by CORS policy
- Some servers may not support Range requests (required for efficient magic byte detection)
- Some servers send incorrect Content-Type headers

### file:// URLs
- Browser support for `file://` URLs is limited by security policies
- Electron apps have better support depending on configuration
- Random access to local files may not work in standard browsers

### Detection Accuracy
- Extension-based detection has low confidence (files can be renamed)
- Text-based formats cannot be detected from content alone
- Some formats may not be reliably detected within the default 64-byte limit

### Performance
- Text preview is limited to 1MB to avoid performance issues
- Very large files may be slow to detect if Range requests aren't supported
- Archive preview (Milestone 4) will be intentionally partial

### Object URL Lifecycle
- Object URLs are automatically created and revoked
- Be aware of memory implications for many large files
- URLs become invalid when the component unmounts

### Browser Compatibility
- Requires modern browsers with File/Blob API support
- Some MIME types may not be playable in all browsers
- Video/audio playback depends on codec support

## Roadmap

### Milestone 2 - Syntax Highlighting
- [ ] Code viewer with syntax highlighting
- [ ] Language detection from MIME type and extension
- [ ] Support for common programming languages
- [ ] Optional highlighting (keeps bundle small)

### Milestone 3 - PDF Support
- [ ] PDF.js-based viewer
- [ ] Electron renderer process compatibility
- [ ] Configurable worker setup
- [ ] Optional entry point (`react-smart-file-preview/pdf`)

### Milestone 4 - Archive Preview
- [ ] List contents of ZIP, TAR, TGZ archives
- [ ] Show first ~12 entries for quick preview
- [ ] Minimal parsing for performance
- [ ] Support for Range requests
- [ ] Optional entry point (`react-smart-file-preview/archive`)

## Development

### Running Tests

```bash
npm test
```

### Running Test App

```bash
npm run dev
```

The test app provides:
- Visual testing of all supported file types
- Keyboard navigation (arrow keys, j/k, 1-9)
- Quick switching to test abort behavior
- Detection result display

### Building

```bash
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. Tests pass: `npm test`
2. TypeScript compiles: `npm run type-check`
3. Follow the existing code style
4. Add tests for new features

## Credits

Built with React and TypeScript.
