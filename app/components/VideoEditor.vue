<script setup lang="ts">
import { computed } from "vue";
import { useVideoThumbnail } from "../composables/useVideoThumbnail";
import type { VideoEditorProps, VideoEditorEmits } from "../types";

const props = defineProps<VideoEditorProps>();

const emit = defineEmits<VideoEditorEmits>();

const videoElementRef = computed(() => props.videoElement);

// Use the video thumbnail composable
const { isProcessing, error, generateThumbnail, isReady } = useVideoThumbnail({
  videoElement: videoElementRef,
});

// Handle thumbnail generation and emit event
const handleGenerateThumbnail = async () => {
  const result = await generateThumbnail();
  if (result) return emit("thumbnail-generated", result);
  throw new Error("Failed to generate thumbnail");
};
</script>

<template>
  <!-- Thumbnail capture overlay -->
  <div class="absolute top-0 right-0 p-2.5 z-10">
    <div class="flex flex-col items-end gap-2">
      <UButton
        @click="handleGenerateThumbnail"
        :disabled="isProcessing || !isReady"
        :loading="isProcessing"
        size="lg"
        :icon="isProcessing ? 'i-heroicons-clock' : 'i-heroicons-camera'"
        color="neutral"
        class="backdrop-blur-md shadow-lg rounded-xl"
      >
        {{ isProcessing ? "Generating..." : "Capture" }}
      </UButton>
      <div
        v-if="error"
        class="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded backdrop-blur-md"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>
