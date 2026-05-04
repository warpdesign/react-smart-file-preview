import { FileSource, MimeDetectionResult } from '../detection';

export type ViewerComponentProps = {
  source: FileSource;
  url: string;
  mimeType: string | null;
  detection: MimeDetectionResult;
};

export type ViewerComponent = React.ComponentType<ViewerComponentProps>;

export type ViewerRegistry = {
  byMimeType?: Record<string, ViewerComponent>;
  byFamily?: Record<string, ViewerComponent>;
  fallback?: ViewerComponent;
};
