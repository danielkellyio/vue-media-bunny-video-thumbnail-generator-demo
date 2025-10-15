import { ref, watch, onUnmounted } from "vue";
import { Input, ALL_FORMATS, BlobSource, CanvasSink } from "mediabunny";
import type {
  UseVideoThumbnailOptions,
  UseVideoThumbnailReturn,
  ThumbnailGeneratedData,
} from "../types";

export function useVideoThumbnail(
  options: UseVideoThumbnailOptions
): UseVideoThumbnailReturn {
  const { videoElement } = options;

  // Reactive state
  const isReady = ref(false);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);
  const videoTrack = ref<any>(null);
  const sink = ref<CanvasSink | null>(null);
  const canvas = document.createElement("canvas");
  const videoWidth = ref(0);
  const videoHeight = ref(0);

  // Initialize Media Bunny
  const initializeMediaBunny = async () => {
    const source = videoElement.value?.querySelector("source")?.src;

    if (!source || !videoElement.value) return;

    videoWidth.value = videoElement.value.videoWidth;
    videoHeight.value = videoElement.value?.videoHeight;

    try {
      error.value = null;

      // Fetch the video blob from the video element's src (which should be a URL)
      const response = await fetch(source);
      const sourceBlob = await response.blob();

      const input = new Input({
        formats: ALL_FORMATS,
        source: new BlobSource(sourceBlob),
      });

      const track = await input.getPrimaryVideoTrack();
      if (!track) {
        throw new Error("No video track found");
      }

      const decodable = await track.canDecode();
      if (!decodable) {
        throw new Error("Video track cannot be decoded");
      }

      videoTrack.value = track;

      // Initialize sink with correct dimensions
      if (videoWidth.value && videoHeight.value) {
        sink.value = new CanvasSink(track, {
          width: videoWidth.value,
        });
      }
      isReady.value = true;
    } catch (err) {
      isReady.value = false;
      const errorMessage =
        err instanceof Error ? err.message : "Error initializing Media Bunny";
      error.value = errorMessage;
      console.error("Error initializing Media Bunny:", err);
    }
  };

  // Generate thumbnail at current time
  const generateThumbnail =
    async (): Promise<ThumbnailGeneratedData | null> => {
      if (!sink.value) {
        error.value = "Thumbnail generator not initialized";
        return null;
      }

      if (!videoElement.value) {
        error.value = "Video element not available";
        return null;
      }

      try {
        isProcessing.value = true;
        error.value = null;

        const currentTime = videoElement.value.currentTime;
        const result = await sink.value.getCanvas(currentTime);

        if (!result) {
          throw new Error("Failed to generate thumbnail");
        }

        // Draw to the internal canvas element
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Set the canvas dimensions to the video dimensions
        canvas.width = videoWidth.value;
        canvas.height = videoHeight.value;

        // Draw the thumbnail to the canvas
        ctx.drawImage(result.canvas, 0, 0);

        // Return the thumbnail data
        return {
          canvas,
          timestamp: result.timestamp,
          dataUrl: canvas.toDataURL("image/png"),
        };
      } catch (err) {
        throw new Error("Error generating thumbnail", { cause: err });
      } finally {
        isProcessing.value = false;
      }
    };

  // Watch for video element and metadata changes
  watch(
    videoElement,
    (newElement) => {
      if (newElement && newElement.readyState >= 1) {
        initializeMediaBunny();
      } else if (newElement) {
        // Wait for metadata to load
        const handleMetadata = () => {
          initializeMediaBunny();
          newElement.removeEventListener("loadedmetadata", handleMetadata);
        };
        newElement.addEventListener("loadedmetadata", handleMetadata);
      }
    },
    { immediate: true }
  );

  // Watch for video dimensions changes to re-initialize sink
  watch([videoWidth, videoHeight], () => {
    if (videoTrack.value && videoWidth.value && videoHeight.value) {
      sink.value = new CanvasSink(videoTrack.value, {
        width: videoWidth.value,
      });
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    // Clean up canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clean up MediaBunny resources
    videoTrack.value = null;
    sink.value = null;
  });

  return {
    isProcessing,
    isReady,
    error,
    videoTrack,
    sink,
    generateThumbnail,
  };
}
