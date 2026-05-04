# NPM Publishing Checklist

## Current Status: ✅ Ready to Publish (with minor updates needed)

## Package Name Suggestions

The current name `react-smart-file-preview` is good, but here are alternatives to avoid conflict with `react-doc-viewer`:

### Recommended Names (in order of preference):

1. **`@yourusername/react-file-preview`** ⭐ BEST
   - Scoped package (no conflicts)
   - Clean, professional
   - Easy to remember

2. **`react-magic-preview`**
   - Highlights the magic byte detection feature
   - Memorable and unique
   - Available on npm (checked)

3. **`react-file-detective`**
   - Emphasizes smart detection
   - Fun and memorable
   - Unique angle

4. **`react-mime-preview`**
   - Technical and accurate
   - Clearly describes what it does
   - Professional

5. **`react-smart-preview`**
   - Shorter version of current name
   - Still clear and professional

6. **`react-preview-pro`**
   - Professional sounding
   - Short and memorable

7. **`react-fileview`**
   - Simple and clear
   - One word, easy to type

### To Check Availability:
```bash
npm search react-magic-preview
npm search react-file-detective
npm search react-mime-preview
```

---

## Pre-Publish Checklist

### ✅ Code Quality
- [x] All tests pass (25/25)
- [x] TypeScript compiles without errors
- [x] Build succeeds (CJS + ESM + DTS)
- [x] No console errors in test app

### ⚠️ package.json Updates Needed

#### Required Changes:
- [ ] **Set `author`** - Add your name/email
  ```json
  "author": "Your Name <your.email@example.com>"
  ```

- [ ] **Set `repository`** - Add your GitHub URL
  ```json
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/react-smart-file-preview.git"
  }
  ```

- [ ] **Add `homepage`** (optional but recommended)
  ```json
  "homepage": "https://github.com/yourusername/react-smart-file-preview#readme"
  ```

- [ ] **Add `bugs`** (optional but recommended)
  ```json
  "bugs": {
    "url": "https://github.com/yourusername/react-smart-file-preview/issues"
  }
  ```

#### Optional Improvements:
- [ ] Add more keywords for discoverability:
  ```json
  "keywords": [
    "react",
    "file-preview",
    "mime-type",
    "file-viewer",
    "typescript",
    "magic-bytes",
    "mime-detection",
    "file-detection",
    "document-viewer",
    "image-viewer",
    "video-player",
    "pdf-viewer"
  ]
  ```

### ✅ Documentation
- [x] README.md complete with examples
- [x] API documentation
- [x] Limitations documented
- [x] Installation instructions
- [x] Usage examples
- [x] TypeScript types exported

### ⚠️ Additional Files to Add

#### 1. LICENSE File (Required)
Create `LICENSE` file with MIT license:
```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

#### 2. CHANGELOG.md (Recommended)
```markdown
# Changelog

## [0.1.0] - 2026-05-04

### Added
- Initial release
- Magic byte detection for binary formats
- MIME type detection from Content-Type headers
- File extension fallback
- Built-in viewers for images, video, audio, and text
- Viewer registry system
- React hooks (useMimeType)
- TypeScript support
- Comprehensive test suite (25 tests)

### Supported Formats
- Images: JPEG, PNG, GIF, WebP, SVG
- Video: MP4, WebM, OGG
- Audio: MP3, WAV, OGG
- Text: Plain text, JSON, Markdown
```

#### 3. .npmignore (Optional)
Create `.npmignore` to exclude test app and dev files:
```
test-app/
src/__tests__/
*.test.ts
*.test.tsx
.git/
.github/
node_modules/
.DS_Store
tsconfig.json
vitest.config.ts
tsup.config.ts
DEVELOPMENT.md
NPM_PUBLISH_CHECKLIST.md
```

### ✅ Build Artifacts
- [x] `dist/` directory exists
- [x] CJS bundle (index.js)
- [x] ESM bundle (index.mjs)
- [x] Type definitions (index.d.ts)
- [x] Source maps included
- [x] Optional entry points (pdf.js, archive.js)

### ✅ Package Structure
```
react-smart-file-preview/
├── dist/               ✅ Built files (git-ignored)
│   ├── index.js       ✅ CJS bundle
│   ├── index.mjs      ✅ ESM bundle
│   ├── index.d.ts     ✅ TypeScript definitions
│   ├── pdf.*          ✅ Optional PDF entry
│   └── archive.*      ✅ Optional archive entry
├── src/                ✅ Source code
├── README.md          ✅ Documentation
├── package.json       ⚠️ Needs author/repo
├── LICENSE            ❌ Need to add
├── CHANGELOG.md       ⚠️ Optional but recommended
└── .npmignore         ⚠️ Optional but recommended
```

### ⚠️ Pre-Publish Validation

Run these commands before publishing:

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Run tests
npm run test:ci

# 3. Type check
npm run type-check

# 4. Build
npm run build

# 5. Check package contents (dry-run)
npm pack --dry-run

# 6. Check package size
npm pack
ls -lh *.tgz

# 7. Test package locally
npm link
cd ../test-project
npm link react-smart-file-preview

# 8. Verify package.json
npm pkg get name version description author license repository
```

### 📦 Publishing Commands

```bash
# First time: Login to npm
npm login

# Check who you're logged in as
npm whoami

# Publish to npm (this actually publishes!)
npm publish

# For scoped packages (if using @username/package-name)
npm publish --access public
```

### ⚠️ Important Notes

1. **Version Numbering**: Start with `0.1.0` for initial release
2. **Scoped Packages**: Use `@username/package-name` to avoid name conflicts
3. **Test Before Publishing**: Always `npm pack` and test locally first
4. **No Undo**: Once published, you cannot unpublish after 24 hours (only deprecate)
5. **Semver**: Follow semantic versioning (major.minor.patch)

---

## Post-Publish Checklist

After publishing:

- [ ] Test installation: `npm install react-smart-file-preview`
- [ ] Verify npm page: https://npmjs.com/package/react-smart-file-preview
- [ ] Add npm badge to README:
  ```markdown
  [![npm version](https://badge.fury.io/js/react-smart-file-preview.svg)](https://www.npmjs.com/package/react-smart-file-preview)
  [![npm downloads](https://img.shields.io/npm/dm/react-smart-file-preview.svg)](https://www.npmjs.com/package/react-smart-file-preview)
  ```
- [ ] Tweet/share announcement
- [ ] Consider adding to:
  - awesome-react lists
  - React component directories
  - Product Hunt

---

## Current Package Stats

- **Size**: ~32KB (index.js) + ~29KB (index.mjs) = ~61KB total
- **Dependencies**: 0 (peer dependency: react)
- **TypeScript**: Full support
- **Tests**: 25 passing
- **Bundle formats**: CJS + ESM
- **Type definitions**: Included
- **Tree-shakeable**: Yes (ESM)

---

## What's Working

✅ Magic byte detection (14 formats)
✅ MIME type detection from headers
✅ File extension fallback
✅ 5 built-in viewers
✅ Custom viewer registry
✅ React hooks
✅ TypeScript types
✅ Comprehensive tests
✅ Test app with keyboard navigation
✅ Documentation
✅ Performance optimized (64-byte limit)

---

## Known Limitations (Documented)

- CORS may block remote files
- Some servers don't support Range requests
- Text formats not detected by content heuristics
- Archive preview not yet implemented (Milestone 4)
- PDF viewer not yet implemented (Milestone 3)
- Syntax highlighting not yet implemented (Milestone 2)

---

## Summary

**Status**: 95% ready to publish

**Required before publishing**:
1. Add LICENSE file
2. Set author in package.json
3. Set repository URL in package.json
4. Choose final package name

**Recommended before publishing**:
1. Add CHANGELOG.md
2. Add .npmignore
3. Test with `npm pack`
4. Add more keywords

**Time to publish**: ~15 minutes (after making the above changes)
