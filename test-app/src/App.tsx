import { useState, useEffect, useRef } from 'react';
import { FilePreview } from 'react-smart-file-preview';
import './App.css';

// Test file samples with real files from public sources
const testFiles = [
  {
    name: 'JPEG Image (remote)',
    description: 'Sample JPEG from picsum.photos',
    generate: () => 'https://picsum.photos/id/237/600/400.jpg',
  },
  {
    name: 'PNG Image (remote)',
    description: 'Sample PNG from picsum.photos',
    generate: () => 'https://picsum.photos/id/1/600/400',
  },
  {
    name: 'SVG Image (inline)',
    description: 'Inline SVG - detected by MIME type',
    generate: () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#grad1)"/>
        <circle cx="300" cy="200" r="100" fill="#ffffff" opacity="0.3"/>
        <text x="300" y="210" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">SVG Test</text>
        <text x="300" y="250" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">Detected by MIME type</text>
      </svg>`;
      return new File([svg], 'graphic.svg', { type: 'image/svg+xml' });
    },
  },
  {
    name: 'MP4 Video (local)',
    description: 'Big Buck Bunny - 10s video (968KB)',
    generate: () => '/test-files/video.mp4',
  },
  {
    name: 'WebM Video (local)',
    description: 'Big Buck Bunny - WebM format (1MB)',
    generate: () => '/test-files/video.webm',
  },
  {
    name: 'MP3 Audio (local)',
    description: 'SoundHelix music sample (8.5MB)',
    generate: () => '/test-files/audio.mp3',
  },
  {
    name: 'JSON File (local)',
    description: 'JSON with Content-Type detection',
    generate: () => '/test-files/test.json',
  },
  {
    name: 'Markdown File (local)',
    description: 'Markdown text file',
    generate: () => '/test-files/README.md',
  },
  {
    name: 'Fake ZIP (local)',
    description: 'Text starting with "PKZIP" - NOT a valid ZIP',
    generate: () => '/test-files/fake-zip.txt',
  },
  {
    name: 'ZIP Archive (inline)',
    description: 'Valid ZIP signature - PK\\x03\\x04',
    generate: () => {
      // Valid ZIP signature but minimal archive
      const bytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04]); // PK\x03\x04
      return new File([bytes], 'archive.zip', { type: '' });
    },
  },
  {
    name: 'Plain Text (inline)',
    description: 'Generated text file - tests Blob.type',
    generate: () => {
      const text = `Plain Text File Test
=====================

This is a plain text file created inline for testing.

Detection fallback chain:
1. Magic bytes (none for plain text)
2. Blob.type property
3. File extension (.txt)

This file has Blob.type set to "text/plain" so detection
should succeed at step 2 with medium confidence.`;
      return new File([text], 'sample.txt', { type: 'text/plain' });
    },
  },
  {
    name: 'Data URL (PNG)',
    description: 'Base64-encoded 1x1 red pixel - tests data URL handling',
    generate: () => {
      // 1x1 red pixel PNG
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    },
  },
  {
    name: 'JPEG Named .txt (local)',
    description: 'Valid JPEG renamed to .txt - tests magic byte priority over extension',
    generate: () => '/test-files/image-renamed.txt',
  },
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | Blob | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate the current test file
  useEffect(() => {
    // Abort previous loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    // Simulate async loading to test abort behavior
    const timer = setTimeout(() => {
      if (!controller.signal.aborted) {
        const file = testFiles[currentIndex].generate();
        setCurrentFile(file);
        setIsLoading(false);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % testFiles.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + testFiles.length) % testFiles.length);
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < testFiles.length) {
          e.preventDefault();
          setCurrentIndex(index);
        }
      } else if (e.key === '0') {
        const index = 9;
        if (index < testFiles.length) {
          e.preventDefault();
          setCurrentIndex(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const currentTest = testFiles[currentIndex];

  return (
    <div className="app">
      <header>
        <h1>File Preview Test App</h1>
        <p className="subtitle">Test MIME detection and file preview with keyboard navigation</p>
      </header>

      <div className="container">
        <aside className="sidebar">
          <h2>Test Files ({testFiles.length})</h2>
          <div className="file-list">
            {testFiles.map((file, index) => (
              <button
                key={index}
                className={`file-item ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="file-number">{index + 1}</span>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-desc">{file.description}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="keyboard-help">
            <h3>Keyboard shortcuts</h3>
            <ul>
              <li><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> Navigate</li>
              <li><kbd>j</kbd> <kbd>k</kbd> Next/Previous</li>
              <li><kbd>1</kbd>-<kbd>9</kbd> Jump to file</li>
            </ul>
          </div>
        </aside>

        <main className="preview-area">
          <div className="preview-header">
            <h2>{currentTest.name}</h2>
            <p>{currentTest.description}</p>
            {isLoading && <span className="loading-badge">Loading...</span>}
          </div>

          <div className="preview-container">
            {currentFile && !isLoading ? (
              <FilePreview source={currentFile} />
            ) : (
              <div className="preview-placeholder">
                {isLoading ? 'Loading...' : 'Select a file to preview'}
              </div>
            )}
          </div>

          <div className="preview-info">
            <h3>File Details</h3>
            {currentFile && (
              <dl>
                <dt>Type:</dt>
                <dd>{typeof currentFile === 'string' ? 'URL' : 'File/Blob'}</dd>

                {typeof currentFile !== 'string' && (
                  <>
                    <dt>Name:</dt>
                    <dd>{(currentFile as File).name || 'unnamed'}</dd>

                    <dt>Size:</dt>
                    <dd>{currentFile.size} bytes</dd>

                    <dt>Blob MIME type:</dt>
                    <dd>{currentFile.type || '(empty)'}</dd>
                  </>
                )}

                {typeof currentFile === 'string' && (
                  <>
                    <dt>URL:</dt>
                    <dd className="url-display">{currentFile}</dd>
                  </>
                )}
              </dl>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
