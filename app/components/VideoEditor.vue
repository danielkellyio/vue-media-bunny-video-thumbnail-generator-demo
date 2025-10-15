<script setup lang="ts">
import { ref, computed, toRef } from "vue";
import VideoPlayer from "./VideoPlayer.vue";
import { useVideoThumbnail } from "../composables/useVideoThumbnail";
import type { VideoEditorProps, VideoEditorEmits, VideoMetadata } from "../types";

const props = withDefaults(defineProps<VideoEditorProps>(), {
  maxThumbnailWidth: 1920,
});

const emit = defineEmits<VideoEditorEmits>();

// Reactive state
const videoPlayerRef = useTemplateRef<InstanceType<typeof VideoPlayer>>("videoPlayerRef");
const videoWidth = ref(0);
const videoHeight = ref(0);

// Get current time from VideoPlayer
const currentTime = computed(() => videoPlayerRef.value?.currentTime ?? 0);

// Handle video metadata loaded event from VideoPlayer
const handleMetadataLoaded = (data: VideoMetadata) => {
  videoWidth.value = data.videoWidth;
  videoHeight.value = data.videoHeight;
};

// Use the video thumbnail composable
const { isProcessing, sink, generateThumbnail } = useVideoThumbnail({
  videoSource: toRef(() => props.videoSource),
  currentTime: currentTime,
  videoWidth: toRef(() => videoWidth.value),
  videoHeight: toRef(() => videoHeight.value),
  maxThumbnailWidth: props.maxThumbnailWidth,
});

// Handle thumbnail generation and emit event
const handleGenerateThumbnail = async () => {
  const result = await generateThumbnail();
  
  if (result) {
    emit("thumbnail-generated", result);
  }
};
</script>

<template>
  <div class="relative">
    <VideoPlayer
      ref="videoPlayerRef"
      :video-source="videoSource"
      @metadata-loaded="handleMetadataLoaded"
    />

    <!-- Thumbnail capture overlay -->
    <div class="absolute top-0 right-0 p-2.5 z-10">
      <UButton
        @click="handleGenerateThumbnail"
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
  </div>
</template>

