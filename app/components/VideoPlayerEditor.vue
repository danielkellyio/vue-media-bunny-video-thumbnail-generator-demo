<script setup lang="ts">
import VideoPlayer from "./VideoPlayer.vue";
import VideoEditor from "./VideoEditor.vue";
import type { VideoPlayerEditorProps, VideoPlayerEditorEmits, ThumbnailGeneratedData } from "../types";

const props = withDefaults(defineProps<VideoPlayerEditorProps>(), {
  editMode: false,
});

const emit = defineEmits<VideoPlayerEditorEmits>();

// Handle thumbnail generation from editor component
const handleThumbnailGenerated = (data: ThumbnailGeneratedData) => {
  emit("thumbnail-generated", data);
};
</script>

<template>
  <VideoEditor
    v-if="editMode"
    :video-source="videoSource"
    @thumbnail-generated="handleThumbnailGenerated"
  />
  <VideoPlayer
    v-else
    :video-source="videoSource"
  />
</template>
