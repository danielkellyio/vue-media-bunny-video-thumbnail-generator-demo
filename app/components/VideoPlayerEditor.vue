<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const VideoEditor = defineAsyncComponent(() => import("./VideoEditor.vue"));
const VideoPlayer = defineAsyncComponent(() => import("./VideoPlayer.vue"));
import type { VideoPlayerEditorProps, VideoPlayerEditorEmits } from "../types";

const props = withDefaults(defineProps<VideoPlayerEditorProps>(), {
  editMode: false,
});

const emit = defineEmits<VideoPlayerEditorEmits>();
</script>

<template>
  <component
    :is="editMode ? VideoEditor : VideoPlayer"
    v-bind="props"
    ref="videoPlayerEditorRef"
    @thumbnail-generated="emit('thumbnail-generated', $event)"
    @metadata-loaded="emit('metadata-loaded', $event)"
  />
</template>
