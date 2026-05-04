// Main component
export { FilePreview } from './components/FilePreview';

// Detection
export {
  detectMimeType,
  getMimeFamily,
  type FileSource,
  type MimeDetectionResult,
  type MimeDetectionOptions,
} from './detection';

// Viewers
export {
  createViewerRegistry,
  DefaultImageViewer,
  DefaultVideoViewer,
  DefaultAudioViewer,
  DefaultTextViewer,
  DefaultFallbackViewer,
  type ViewerComponentProps,
  type ViewerComponent,
  type ViewerRegistry,
} from './viewers';

// Hooks
export { useMimeType } from './hooks/useMimeType';
