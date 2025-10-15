<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from "vue";
import { useMediaControls } from "@vueuse/core";

interface Props {
  videoSource: File | Blob | string;
  editMode?: boolean;
}

interface Emits {
  (
    e: "thumbnail-generated",
    data: {
      canvas: HTMLCanvasElement;
      timestamp: number;
      duration: number;
      dataUrl: string;
    }
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false,
});

const emit = defineEmits<Emits>();

// Reactive state
const videoRef = useTemplateRef<HTMLVideoElement>("videoRef");
const videoUrl = ref<string>("");
const videoWidth = ref(0);
const videoHeight = ref(0);

// Lazy load the thumbnail editor component
const VideoThumbnailEditor = defineAsyncComponent(
  () => import("./VideoThumbnailEditor.vue")
);

// Use VueUse media controls
const { currentTime } = useMediaControls(videoRef, {
  src: videoUrl,
});

// Handle video metadata loaded to get actual dimensions
const onVideoMetadataLoaded = () => {
  if (videoRef.value) {
    videoWidth.value = videoRef.value.videoWidth;
    videoHeight.value = videoRef.value.videoHeight;
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

// Handle thumbnail generation from child component
const handleThumbnailGenerated = (data: {
  canvas: HTMLCanvasElement;
  timestamp: number;
  duration: number;
  dataUrl: string;
}) => {
  emit("thumbnail-generated", data);
};

// Watch for video source changes
watch(
  () => props.videoSource,
  () => {
    initializeVideo();
  },
  { immediate: true }
);
</script>

<template>
  <div class="video-player">
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-player-element"
        controls
        preload="metadata"
        @loadedmetadata="onVideoMetadataLoaded"
      />

      <!-- Lazy-loaded thumbnail editor overlay when in edit mode -->
      <Suspense v-if="editMode">
        <VideoThumbnailEditor
          :video-source="videoSource"
          :current-time="currentTime"
          :video-width="videoWidth"
          :video-height="videoHeight"
          @thumbnail-generated="handleThumbnailGenerated"
        />
      </Suspense>
    </div>
  </div>
</template>

<style scoped>
.video-player {
  max-width: 100%;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.video-player-element {
  width: 100%;
  height: auto;
  display: block;
}
</style>
