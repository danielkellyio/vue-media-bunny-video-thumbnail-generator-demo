<script setup lang="ts">
import ThumbnailCard from "./ThumbnailCard.vue";
import type { ThumbnailGeneratedData } from "../types";

defineProps<{
  thumbnails: Array<ThumbnailGeneratedData>;
}>();
</script>

<template>
  <UCard
    class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
  >
    <template #header>
      <h2 class="text-lg font-semibold">Generated Thumbnails</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ thumbnails.length }} thumbnail{{
          thumbnails.length !== 1 ? "s" : ""
        }}
      </p>
    </template>
    <div class="overflow-y-auto max-h-[calc(100vh-8rem)] h-full flex-1">
      <div class="p-6">
        <div v-if="thumbnails.length > 0" class="flex-col flex gap-4">
          <ThumbnailCard
            v-for="(thumbnail, index) in thumbnails"
            :key="index"
            :thumbnail="thumbnail"
          />
        </div>
        <div v-else class="text-center py-12 font-medium text-sm">
          No thumbnails generated yet.
        </div>
      </div>
    </div>
  </UCard>
</template>
