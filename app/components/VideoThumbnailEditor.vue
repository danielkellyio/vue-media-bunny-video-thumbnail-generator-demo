<script setup lang="ts">
import { ref, toRef } from "vue";
import { useVideoThumbnail, type ThumbnailGeneratedData } from "../composables/useVideoThumbnail";

interface Props {
  videoSource: File | Blob | string;
  currentTime: number;
  videoWidth: number;
  videoHeight: number;
  maxThumbnailWidth?: number;
}

interface Emits {
  (e: "thumbnail-generated", data: ThumbnailGeneratedData): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxThumbnailWidth: 1920,
});

const emit = defineEmits<Emits>();

// Canvas ref
const canvasRef = ref<HTMLCanvasElement>();

// Use the video thumbnail composable
const { isProcessing, sink, generateThumbnail: generateThumbnailFromComposable } = useVideoThumbnail({
  videoSource: toRef(() => props.videoSource),
  currentTime: toRef(() => props.currentTime),
  videoWidth: toRef(() => props.videoWidth),
  videoHeight: toRef(() => props.videoHeight),
  maxThumbnailWidth: props.maxThumbnailWidth,
});

// Wrapper function to handle canvas ref and emit event
const generateThumbnail = async () => {
  if (!canvasRef.value) {
    throw new Error("Canvas ref not found");
  }

  const result = await generateThumbnailFromComposable(canvasRef.value);
  
  if (result) {
    emit("thumbnail-generated", result);
  }
};

defineExpose({
  generateThumbnail,
  isProcessing,
});
</script>

<template>
  <div class="absolute top-0 right-0 p-2.5 z-10">
    <canvas ref="canvasRef" style="display: none" />

    <UButton
      @click="generateThumbnail"
      :disabled="isProcessing || !sink"
      :loading="isProcessing"
      size="lg"
      :icon="isProcessing ? 'i-heroicons-clock' : 'i-heroicons-camera'"
      color="neutral"
      class="backdrop-blur-md shadow-lg rounded-xl"
    >
      {{ isProcessing ? "Generating..." : "Capture" }}
    </UButton>
  </div>
</template>
