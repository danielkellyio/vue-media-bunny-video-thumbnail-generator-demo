import { ref, watch, computed } from "vue";
import { Input, ALL_FORMATS, BlobSource, CanvasSink } from "mediabunny";
import type {
  UseVideoThumbnailOptions,
  ThumbnailGeneratedData,
} from "../types";

export function useVideoThumbnail(options: UseVideoThumbnailOptions) {
  const {
    videoSource,
    currentTime,
    videoWidth,
    videoHeight,
    maxThumbnailWidth = 1920,
  } = options;

  // Reactive state
  const isProcessing = ref(false);
  const videoTrack = ref<any>(null);
  const sink = ref<CanvasSink | null>(null);
  const canvas = document.createElement("canvas");

  // Computed thumbnail dimensions based on video aspect ratio
  const thumbnailWidth = computed(() => {
    if (!videoWidth.value || !videoHeight.value) return maxThumbnailWidth;

    // If video width is already smaller than max, use original dimensions
    if (videoWidth.value <= maxThumbnailWidth) {
      return videoWidth.value;
    }

    // Scale down to max width while maintaining aspect ratio
    return maxThumbnailWidth;
  });

  const thumbnailHeight = computed(() => {
    if (!videoWidth.value || !videoHeight.value)
      return Math.round(maxThumbnailWidth * 0.75);

    const aspectRatio = videoHeight.value / videoWidth.value;
    return Math.round(thumbnailWidth.value * aspectRatio);
  });

  // Initialize Media Bunny
  const initializeMediaBunny = async () => {
    if (!videoSource.value) return;

    try {
      isProcessing.value = true;

      // Handle string URLs by creating a blob from fetch
      let sourceBlob: Blob;
      if (typeof videoSource.value === "string") {
        const response = await fetch(videoSource.value);
        sourceBlob = await response.blob();
      } else {
        sourceBlob = videoSource.value;
      }

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
          width: thumbnailWidth.value,
        });
      }
    } catch (error) {
      console.error("Error initializing Media Bunny:", error);
    } finally {
      isProcessing.value = false;
    }
  };

  // Generate thumbnail at current time
  const generateThumbnail =
    async (): Promise<ThumbnailGeneratedData | null> => {
      if (!sink.value) {
        throw new Error("Attempting to generate thumbnail with sink not found");
      }

      try {
        isProcessing.value = true;

        const result = await sink.value.getCanvas(currentTime.value);

        if (!result) {
          throw new Error("Failed to generate thumbnail");
        }

        // Draw to the internal canvas element
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        canvas.width = thumbnailWidth.value;
        canvas.height = thumbnailHeight.value;
        ctx.drawImage(result.canvas, 0, 0);

        // Return the thumbnail data
        return {
          canvas,
          timestamp: result.timestamp,
          dataUrl: canvas.toDataURL("image/png"),
        };
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        return null;
      } finally {
        isProcessing.value = false;
      }
    };

  // Watch for video dimensions changes to re-initialize sink
  watch([videoWidth, videoHeight], () => {
    if (videoTrack.value && videoWidth.value && videoHeight.value) {
      sink.value = new CanvasSink(videoTrack.value, {
        width: thumbnailWidth.value,
      });
    }
  });

  // Initialize on video source change
  watch(
    videoSource,
    () => {
      initializeMediaBunny();
    },
    { immediate: true }
  );

  return {
    isProcessing,
    videoTrack,
    sink,
    thumbnailWidth,
    thumbnailHeight,
    generateThumbnail,
  };
}
