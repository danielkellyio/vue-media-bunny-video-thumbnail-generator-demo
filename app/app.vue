<script setup lang="ts">
import { ref } from "vue";
import VideoPlayer from "./components/VideoPlayer.vue";

const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement>();
const generatedThumbnails = ref<
  Array<{
    canvas: HTMLCanvasElement;
    timestamp: number;
    dataUrl: string;
  }>
>([]);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleThumbnailGenerated = (data: {
  canvas: HTMLCanvasElement;
  timestamp: number;
  dataUrl: string;
}) => {
  generatedThumbnails.value.push(data);
  console.log("Thumbnail generated:", data);
};

const downloadThumbnail = (dataUrl: string, timestamp: number) => {
  const link = document.createElement("a");
  link.download = `thumbnail-${timestamp.toFixed(2)}s.png`;
  link.href = dataUrl;
  link.click();
};
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-gradient-to-br p-4 md:p-6">
      <NuxtRouteAnnouncer />

      <UContainer class="max-w-6xl mx-auto">
        <UCard class="overflow-hidden">
        

          <!-- File Upload Section -->
          <div class="py-6 border-b border-gray-200 dark:border-gray-800">
            <div class="flex justify-center mb-4">
              <input
                ref="fileInputRef"
                type="file"
                id="video-file"
                accept="video/*"
                @change="handleFileSelect"
                class="hidden"
              />
              <UButton
                @click="triggerFileInput"
                size="lg"
                icon="i-heroicons-folder-open"
                color="primary"
              >
                Choose Video File
              </UButton>
            </div>

            <div v-if="selectedFile" class="text-center space-y-1">
              <p class="text-gray-700 dark:text-gray-300">
                <span class="font-semibold">Selected:</span> {{ selectedFile.name }}
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                <span class="font-semibold">Size:</span>
                {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
              </p>
            </div>
          </div>

          <!-- Video Player Section -->
          <div v-if="selectedFile" class="py-6">
            <VideoPlayer
              :video-source="selectedFile"
              :edit-mode="true"
              @thumbnail-generated="handleThumbnailGenerated"
            />
          </div>

          <!-- Thumbnails Section -->
          <div class="bg-gray-50 dark:bg-gray-900/50 -m-6 mt-0 p-6">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Generated Thumbnails</h2>
            <div v-if="generatedThumbnails.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <UCard
                v-for="(thumbnail, index) in generatedThumbnails"
                :key="index"
                class="hover:-translate-y-1 transition-transform duration-200"
              >
                <img
                  :src="thumbnail.dataUrl"
                  :alt="`Thumbnail at ${thumbnail.timestamp}s`"
                  class="w-full h-auto rounded mb-3"
                />
                <div class="text-center space-y-3">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-semibold">Timestamp:</span>
                    {{ thumbnail.timestamp.toFixed(2) }}s
                  </p>
                  <UButton
                    @click="downloadThumbnail(thumbnail.dataUrl, thumbnail.timestamp)"
                    color="success"
                    icon="i-heroicons-arrow-down-tray"
                    block
                  >
                    Download
                  </UButton>
                </div>
              </UCard>
            </div>
            <div v-else class="text-center py-12 text-gray-400 dark:text-gray-500 text-lg font-medium">
              No thumbnails generated yet.
            </div>
          </div>
        </UCard>
      </UContainer>
    </div>
  </UApp>
</template>
