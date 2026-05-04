import { ViewerComponentProps } from './types';

export function DefaultImageViewer({ url, detection }: ViewerComponentProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      maxHeight: '70vh',
      overflow: 'hidden',
      boxSizing: 'border-box',
      // Checkered background pattern (like Photoshop)
      backgroundImage: `
        linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
        linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
        linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    }}>
      <img
        src={url}
        alt="Preview"
        style={{
          maxWidth: '100%',
          maxHeight: '70vh',
          width: 'auto',
          height: 'auto',
          display: 'block',
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
