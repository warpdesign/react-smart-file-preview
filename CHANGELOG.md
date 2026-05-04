# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-04

### Added
- Initial release - Milestone 1 MVP
- Magic byte detection for binary file formats
- MIME type detection from Content-Type headers
- File extension fallback detection
- Viewer registry system with exact MIME type and family matching
- Built-in viewers:
  - DefaultImageViewer (JPEG, PNG, GIF, WebP, SVG)
  - DefaultVideoViewer (MP4, WebM, OGG)
  - DefaultAudioViewer (MP3, WAV, OGG)
  - DefaultTextViewer (plain text, JSON, Markdown)
  - DefaultFallbackViewer (with download/open links)
- FilePreview main React component
- useMimeType React hook for custom detection workflows
- TypeScript support with full type definitions
- Comprehensive test suite (25 tests, 100% passing)
- Test application with keyboard navigation

### Supported Formats
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Video**: MP4, WebM, OGG
- **Audio**: MP3, WAV, OGG
- **Text**: Plain text, JSON, Markdown, and other text-based formats
- **Archives**: ZIP detection (viewing in Milestone 4)
- **Documents**: PDF detection (viewing in Milestone 3)

### Magic Byte Support
- JPEG (FF D8 FF)
- PNG (89 50 4E 47 0D 0A 1A 0A)
- GIF (GIF87a / GIF89a)
- WebP (RIFF + WEBP marker)
- MP4 (ftyp box)
- WebM (EBML header)
- OGG (OggS)
- MP3 (ID3 tag or frame sync)
- WAV (RIFF + WAVE marker)
- PDF (%PDF-)
- ZIP (PK\x03\x04, PK\x05\x06, PK\x07\x08)

### Performance Features
- Only reads 64 bytes for magic byte detection (configurable)
- Never escalates to larger reads
- Parallel HEAD + Range requests for HTTP/HTTPS URLs
- Proper AbortController support for cancellation
- Object URL lifecycle management
- No memory leaks

### Documentation
- Comprehensive README with API documentation
- Usage examples and code samples
- Clear documentation of all limitations
- DEVELOPMENT.md for contributors
- Type definitions for TypeScript users

### Known Limitations
- CORS may block remote file access
- Some servers don't support Range requests
- Text-based formats not detected by content heuristics (by design)
- file:// URL support depends on browser security settings
- Extension fallback has low confidence

## [Unreleased]

### Planned for Milestone 2
- Syntax-highlighted code viewer
- Language detection from MIME type and extension
- Support for 20+ programming languages
- Optional highlighting to keep bundle small

### Planned for Milestone 3
- PDF.js-based PDF viewer
- Electron renderer process compatibility
- Configurable worker setup
- Optional entry point (react-smart-file-preview/pdf)

### Planned for Milestone 4
- Archive preview for ZIP and TAR files
- List first ~12 entries for quick preview
- Minimal parsing for performance
- Range request support
- Optional entry point (react-smart-file-preview/archive)

[0.1.0]: https://github.com/yourusername/react-smart-file-preview/releases/tag/v0.1.0
