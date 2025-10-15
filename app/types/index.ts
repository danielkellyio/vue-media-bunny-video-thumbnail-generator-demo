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
  (e: "metadata-loaded", data: VideoMetadata): void;
}

// VideoPlayerEditor component types
export type VideoPlayerEditorProps = VideoPlayerProps &
  VideoEditorProps & {
    editMode?: boolean;
  };
export type VideoPlayerEditorEmits = VideoPlayerEmits & VideoEditorEmits;
