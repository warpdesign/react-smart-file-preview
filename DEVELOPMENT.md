# Development Guide

## Project Structure

```
react-smart-file-preview/
├── src/
│   ├── components/
│   │   └── FilePreview.tsx       # Main preview component
│   ├── detection/
│   │   ├── types.ts              # Detection types
│   │   ├── magicBytes.ts         # Magic byte detection
│   │   ├── extension.ts          # Extension-based detection
│   │   ├── detector.ts           # Main detection logic
│   │   └── index.ts
│   ├── viewers/
│   │   ├── types.ts              # Viewer types
│   │   ├── registry.ts           # Viewer resolution logic
│   │   ├── DefaultImageViewer.tsx
│   │   ├── DefaultVideoViewer.tsx
│   │   ├── DefaultAudioViewer.tsx
│   │   ├── DefaultTextViewer.tsx
│   │   ├── DefaultFallbackViewer.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── useMimeType.ts        # MIME detection hook
│   ├── utils/
│   │   └── objectUrl.ts          # Object URL lifecycle
│   ├── __tests__/
│   │   └── mimeDetection.test.ts # Comprehensive tests
│   ├── index.ts                  # Main entry point
│   ├── pdf.ts                    # PDF entry (Milestone 3)
│   └── archive.ts                # Archive entry (Milestone 4)
├── test-app/                     # Test application
│   ├── src/
│   │   ├── App.tsx               # Test UI with keyboard navigation
│   │   ├── App.css
│   │   └── main.tsx
│   └── index.html
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── README.md
```

## Quick Start

### Install Dependencies

```bash
npm install
cd test-app && npm install && cd ..
```

### Run Tests

```bash
npm test          # Watch mode
npm run test:ci   # CI mode (single run)
```

### Build Package

```bash
npm run build
```

### Run Test App

```bash
npm run dev
```

The test app will start at http://localhost:5173

## Test App Features

The test app provides comprehensive testing for all MIME detection scenarios:

### File Types Tested

1. **JPEG with .txt extension** - Tests magic byte priority over extension
2. **PNG** - Standard PNG detection
3. **GIF** - GIF89a format
4. **WebP** - RIFF/WEBP container
5. **PDF** - %PDF- marker
6. **ZIP (valid)** - PK\x03\x04 signature
7. **Fake ZIP** - Text starting with "PKZIP" (should NOT be detected as ZIP)
8. **MP4** - ftyp box detection
9. **MP3** - ID3 tag detection
10. **Plain text** - Extension-only detection
11. **JSON** - MIME type detection
12. **SVG** - MIME type detection
13. **HTTP URL** - Remote file
14. **Data URL** - Base64 encoded image

### Keyboard Navigation

- `↑` `↓` `←` `→` - Navigate files
- `j` `k` - Next/Previous file
- `1`-`9` - Jump to file by number

The keyboard navigation is intentionally fast to test:
- AbortController behavior when quickly switching
- Object URL cleanup
- Loading state management
- Memory leak prevention

## Testing Guidelines

### Manual Testing Checklist

When testing the package:

1. **Magic Byte Detection**
   - [ ] JPEG file named .txt detected as image/jpeg
   - [ ] PNG magic bytes override wrong MIME type
   - [ ] ZIP detection requires valid signatures
   - [ ] Text starting with "PKZIP" NOT detected as ZIP

2. **Priority System**
   - [ ] Magic bytes override MIME type
   - [ ] Magic bytes override file extension
   - [ ] MIME type used when no magic bytes
   - [ ] Extension used as last resort

3. **Text-Based Formats**
   - [ ] JSON detected by MIME type, not content
   - [ ] SVG detected by MIME type, not content
   - [ ] Plain text not detected by heuristics

4. **Performance**
   - [ ] Quick file switching works smoothly
   - [ ] No memory leaks with rapid switching
   - [ ] Loading states appear/disappear correctly
   - [ ] Large files don't block UI

5. **Error Handling**
   - [ ] Invalid URLs show error state
   - [ ] CORS errors handled gracefully
   - [ ] Aborted requests don't cause errors

## Development Workflow

### Adding a New Magic Byte Signature

1. Add signature to `src/detection/magicBytes.ts`:

```typescript
const MAGIC_SIGNATURES: MagicSignature[] = [
  // Add your signature
  { bytes: [0xAB, 0xCD], offset: 0, mimeType: 'application/example' },
  // ...
];
```

2. Add test in `src/__tests__/mimeDetection.test.ts`:

```typescript
it('should detect EXAMPLE format', async () => {
  const bytes = new Uint8Array([0xAB, 0xCD]);
  const file = new File([bytes], 'file.example', { type: '' });
  const result = await detectMimeType(file);
  expect(result.mimeType).toBe('application/example');
  expect(result.source).toBe('magic-bytes');
});
```

3. Add test file to test app in `test-app/src/App.tsx`:

```typescript
{
  name: 'EXAMPLE format',
  description: 'Description of the format',
  generate: () => {
    const bytes = new Uint8Array([0xAB, 0xCD]);
    return new File([bytes], 'file.example', { type: '' });
  },
}
```

4. Run tests and verify in test app

### Adding a New Viewer

1. Create viewer component in `src/viewers/`:

```typescript
export function MyViewer({ url, detection }: ViewerComponentProps) {
  return <div>Custom viewer for {url}</div>;
}
```

2. Export from `src/viewers/index.ts`

3. Document in README.md

### Adding a New File Extension

Add to `src/detection/extension.ts`:

```typescript
const EXTENSION_TO_MIME: Record<string, string> = {
  // ...
  '.example': 'application/example',
};
```

## Common Issues

### Tests Fail with "blob.arrayBuffer is not a function"

This happens in older Node environments. The code includes a fallback using FileReader for jsdom compatibility.

### Build Fails with "types not exported"

Ensure types are properly exported with `export type` in the registry file.

### Test App Shows "Cannot find module"

Make sure to build the package first:

```bash
npm run build
cd test-app && npm run dev
```

## Milestone Roadmap

### ✅ Milestone 1 - MVP (Complete)

- [x] MIME detection with magic bytes
- [x] Viewer registry system
- [x] FilePreview component
- [x] Built-in viewers (image, video, audio, text, fallback)
- [x] Comprehensive tests
- [x] Test app with keyboard navigation
- [x] Documentation

### 🔜 Milestone 2 - Syntax Highlighting

- [ ] Code viewer with syntax highlighting
- [ ] Language detection from MIME type/extension
- [ ] Support for common programming languages
- [ ] Optional highlighting to keep bundle small

### 🔜 Milestone 3 - PDF Support

- [ ] PDF.js integration
- [ ] Electron compatibility
- [ ] Worker configuration
- [ ] Optional entry point (`/pdf`)

### 🔜 Milestone 4 - Archive Preview

- [ ] ZIP file listing (central directory parsing)
- [ ] TAR file listing (sequential header reading)
- [ ] Limited to first ~12 entries for performance
- [ ] Range request support for HTTP/HTTPS
- [ ] Optional entry point (`/archive`)

## Performance Guidelines

### Magic Byte Reading

- **Never** read more than `maxMagicLength` bytes (default: 64)
- **Never** escalate to larger reads if detection fails
- For URLs, use Range requests when possible
- For Blobs, use `slice()` to read only needed bytes

### Text Preview

- Limit to 1MB by default
- Stream large files
- Show truncation warning
- Allow cancellation via AbortController

### Archive Preview

- Show only first ~12 entries
- Don't extract files
- Don't decompress full archives
- Use byte-range reads when possible

## Code Style

- Use TypeScript strict mode
- Export types separately from implementations
- Document complex algorithms
- Add JSDoc comments for public APIs
- Include "Why" comments, not just "What"
- Test edge cases, especially MIME detection

## Release Checklist

Before publishing:

- [ ] All tests pass (`npm run test:ci`)
- [ ] Build succeeds (`npm run build`)
- [ ] Test app works (`npm run dev`)
- [ ] README is up to date
- [ ] Version bumped in package.json
- [ ] Changelog updated
- [ ] Types exported correctly
- [ ] Bundle size is reasonable

## License

MIT
