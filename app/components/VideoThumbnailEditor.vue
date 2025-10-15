<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Input, ALL_FORMATS, BlobSource, CanvasSink } from "mediabunny";

interface Props {
  videoSource: File | Blob | string;
  currentTime: number;
  videoWidth: number;
  videoHeight: number;
  maxThumbnailWidth?: number;
}

interface Emits {
  (
    e: "thumbnail-generated",
    data: {
      canvas: HTMLCanvasElement;
      timestamp: number;
      dataUrl: string;
    }
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxThumbnailWidth: 1920,
});

const emit = defineEmits<Emits>();

// Reactive state
const canvasRef = ref<HTMLCanvasElement>();
const isProcessing = ref(false);
const videoTrack = ref<any>(null);
const sink = ref<CanvasSink | null>(null);

// Computed thumbnail dimensions based on video aspect ratio
const thumbnailWidth = computed(() => {
  if (!props.videoWidth || !props.videoHeight) return props.maxThumbnailWidth;

  // If video width is already smaller than max, use original dimensions
  if (props.videoWidth <= props.maxThumbnailWidth) {
    return props.videoWidth;
  }

  // Scale down to max width while maintaining aspect ratio
  return props.maxThumbnailWidth;
});

const thumbnailHeight = computed(() => {
  if (!props.videoWidth || !props.videoHeight)
    return Math.round(props.maxThumbnailWidth * 0.75);

  const aspectRatio = props.videoHeight / props.videoWidth;
  return Math.round(thumbnailWidth.value * aspectRatio);
});

// Initialize Media Bunny
const initializeMediaBunny = async () => {
  if (!props.videoSource) return;

  try {
    isProcessing.value = true;

    // Handle string URLs by creating a blob from fetch
    let sourceBlob: Blob;
    if (typeof props.videoSource === "string") {
      const response = await fetch(props.videoSource);
      sourceBlob = await response.blob();
    } else {
      sourceBlob = props.videoSource;
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
    if (props.videoWidth && props.videoHeight) {
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
const generateThumbnail = async () => {
  if (!sink.value || !canvasRef.value) {
    throw new Error(
      "Attempting to generate thumbnail with sink or canvas not found"
    );
  }

  try {
    isProcessing.value = true;

    const result = await sink.value.getCanvas(props.currentTime);

    if (!result) {
      throw new Error("Failed to generate thumbnail");
    }

    // Draw to our canvas element
    const ctx = canvasRef.value.getContext("2d");
    if (!ctx) return;

    canvasRef.value.width = thumbnailWidth.value;
    canvasRef.value.height = thumbnailHeight.value;
    ctx.drawImage(result.canvas, 0, 0);

    // Emit the thumbnail data
    emit("thumbnail-generated", {
      canvas: canvasRef.value,
      timestamp: result.timestamp,
      dataUrl: canvasRef.value.toDataURL("image/png"),
    });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Watch for video dimensions changes to re-initialize sink
watch(
  () => [props.videoWidth, props.videoHeight],
  () => {
    if (videoTrack.value && props.videoWidth && props.videoHeight) {
      sink.value = new CanvasSink(videoTrack.value, {
        width: thumbnailWidth.value,
      });
    }
  }
);

// Initialize on mount
watch(
  () => props.videoSource,
  () => {
    initializeMediaBunny();
  },
  { immediate: true }
);

defineExpose({
  generateThumbnail,
  isProcessing,
});
</script>

<template>
  <div class="video-thumbnail-editor">
    <canvas ref="canvasRef" style="display: none" />

    <button
      @click="generateThumbnail"
      class="generate-btn"
      :disabled="isProcessing || !sink"
      :class="{ processing: isProcessing }"
    >
      <span v-if="isProcessing" class="icon">⏳</span>
      <span v-else class="icon">📸</span>
      <span class="text">{{ isProcessing ? "Generating..." : "Capture" }}</span>
    </button>
  </div>
</template>

<style scoped>
.video-thumbnail-editor {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
}

.generate-btn {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.generate-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.generate-btn.processing {
  background: rgba(37, 99, 235, 0.75);
  border-color: rgba(147, 197, 253, 0.3);
}

.generate-btn .icon {
  font-size: 18px;
  line-height: 1;
}

.generate-btn .text {
  line-height: 1;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.processing .icon {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
