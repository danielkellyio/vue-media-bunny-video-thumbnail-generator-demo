import type { Ref } from "vue";

// Common types
export type VideoSource = File | Blob | string;

export interface VideoMetadata {
  videoWidth: number;
  videoHeight: number;
}

// Thumbnail types
export interface ThumbnailGeneratedData {
  canvas: HTMLCanvasElement;
  timestamp: number;
  dataUrl: string;
}

export interface UseVideoThumbnailOptions {
  videoElement: Ref<HTMLVideoElement | undefined>;
}

export interface UseVideoThumbnailReturn {
  isProcessing: Ref<boolean>;
  isReady: Ref<boolean>;
  error: Ref<string | null>;
  videoTrack: Ref<any>;
  sink: Ref<any>;
  generateThumbnail: () => Promise<ThumbnailGeneratedData | null>;
}

// VideoPlayer component types
export interface VideoPlayerProps {
  videoSource: VideoSource;
}

export interface VideoPlayerEmits {
  (e: "metadata-loaded", data: VideoMetadata): void;
}

// VideoEditor component types
export interface VideoEditorProps {
  videoSource: VideoSource;
}

export interface VideoEditorEmits {
  (e: "thumbnail-generated", data: ThumbnailGeneratedData): void;
  (e: "metadata-loaded", data: VideoMetadata): void;
}
