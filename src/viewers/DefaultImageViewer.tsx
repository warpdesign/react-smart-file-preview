import { ViewerComponentProps } from './types';

export function DefaultImageViewer({ url, detection }: ViewerComponentProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      minHeight: '200px'
    }}>
      <img
        src={url}
        alt="Preview"
        style={{
          maxWidth: '100%',
          maxHeight: '80vh',
          objectFit: 'contain',
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `<div style="color: #d32f2f; padding: 1rem;">Failed to load image: ${detection.mimeType || 'unknown type'}</div>`;
        }}
      />
    </div>
  );
}
