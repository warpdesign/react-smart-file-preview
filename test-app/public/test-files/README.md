# File Preview Test - Markdown

## Overview

This is a **markdown file** being rendered as plain text.

### Features Tested

The MIME detection system handles text-based formats through:
- MIME type detection from Content-Type headers
- File extension fallback (.md → text/markdown)
- **No content heuristics** - never inspects file content

### Detection Priority Chain

1. **Magic bytes** - Binary file signatures (highest priority)
2. **MIME type** - From Content-Type header or Blob.type
3. **Extension** - Fallback based on file name

### Code Example

```javascript
import { FilePreview } from 'react-smart-file-preview';

function App() {
  return <FilePreview source={file} />;
}
```

### Important Notes

> Text-based formats like JSON, Markdown, HTML, and XML are **NOT** detected
> by inspecting content. Only MIME type and extension are used.

> This prevents false positives and ensures predictable behavior.

### Why No Content Heuristics?

Content-based detection for text formats would:
- Require reading more than maxMagicLength bytes
- Be unreliable (any text could look like JSON/HTML)
- Violate the performance-first principle

Instead, we rely on:
- Server-provided Content-Type headers (medium confidence)
- File extensions (low confidence but explicit)

---

*Testing the text viewer component with markdown content*
