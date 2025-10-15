<script setup lang="ts">
import { ref, watch } from "vue";
import { useMediaControls } from "@vueuse/core";
import type { VideoPlayerProps, VideoPlayerEmits } from "../types";

const props = defineProps<VideoPlayerProps>();
const emit = defineEmits<VideoPlayerEmits>();

// Reactive state
const videoRef = useTemplateRef<HTMLVideoElement>("videoRef");
const videoUrl = ref<string>("");

// Use VueUse media controls
const { currentTime } = useMediaControls(videoRef, {
  src: videoUrl,
});

// Handle video metadata loaded to get actual dimensions
const onVideoMetadataLoaded = () => {
  if (videoRef.value) {
    emit("metadata-loaded", {
      videoWidth: videoRef.value.videoWidth,
      videoHeight: videoRef.value.videoHeight,
    });
  }
};

// Handle video source changes
const initializeVideo = async () => {
  if (!props.videoSource) return;

  // Handle string URLs or create object URL for File/Blob
  if (typeof props.videoSource === "string") {
    videoUrl.value = props.videoSource;
  } else {
    // Revoke previous URL if it exists
    if (videoUrl.value && videoUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl.value);
    }
    videoUrl.value = URL.createObjectURL(props.videoSource);
  }
};

// Watch for video source changes
watch(() => props.videoSource, initializeVideo, { immediate: true });
</script>

<template>
  <div class="max-w-full mx-auto">
    <div class="relative bg-black rounded-lg overflow-hidden shadow-lg">
      <video
        ref="videoRef"
        class="w-full h-auto block"
        controls
        preload="metadata"
        @loadedmetadata="onVideoMetadataLoaded"
      />
      <LazyVideoEditor
        v-if="editMode"
        :video-element="videoRef"
        @thumbnail-generated="emit('thumbnail-generated', $event)"
      />
    </div>
  </div>
</template>
