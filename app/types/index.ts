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
  videoSource: Ref<VideoSource | null | undefined>;
  currentTime: Ref<number>;
  videoWidth: Ref<number>;
  videoHeight: Ref<number>;
  maxThumbnailWidth?: number;
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
  maxThumbnailWidth?: number;
}

export interface VideoEditorEmits {
  (e: "thumbnail-generated", data: ThumbnailGeneratedData): void;
}

// VideoPlayerEditor component types
export interface VideoPlayerEditorProps {
  videoSource: VideoSource;
  editMode?: boolean;
}

export interface VideoPlayerEditorEmits {
  (e: "thumbnail-generated", data: ThumbnailGeneratedData): void;
}

