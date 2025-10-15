<script setup lang="ts">
import type { ThumbnailGeneratedData } from "../types";

defineProps<{
  thumbnail: ThumbnailGeneratedData;
}>();

const emit = defineEmits<{
  download: [dataUrl: string, timestamp: number];
}>();

const downloadThumbnail = (dataUrl: string, timestamp: number) => {
  const link = document.createElement("a");
  link.download = `thumbnail-${timestamp.toFixed(2)}s.png`;
  link.href = dataUrl;
  link.click();
};
</script>

<template>
  <div class="hover:-translate-y-1 transition-transform duration-200 group">
    <div class="relative">
      <img
        :src="thumbnail.dataUrl"
        :alt="`Thumbnail at ${thumbnail.timestamp}s`"
        class="w-full h-auto rounded mb-3 block"
      />
      <span
        class="group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] block"
      >
        <UButton
          @click="downloadThumbnail(thumbnail.dataUrl, thumbnail.timestamp)"
          color="success"
          icon="i-heroicons-arrow-down-tray"
          block
        >
          Download
        </UButton>
      </span>
    </div>

    <div class="text-center space-y-3">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-semibold">Timestamp:</span>
        {{ thumbnail.timestamp.toFixed(2) }}s
      </p>
    </div>
  </div>
</template>
