<script setup lang="ts">
import { ref } from "vue";
import type { ThumbnailGeneratedData } from "./types";

const log = console.log;

// ------- handle file select -------
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement>();
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
  }
};
const triggerFileInput = () => fileInputRef.value?.click();

// ------- handle edit mode -------
const editMode = ref(false);
const toggleEditMode = () => (editMode.value = !editMode.value);

// ------- handle generated thumbnails -------
const generatedThumbnails = ref<Array<ThumbnailGeneratedData>>([]);
</script>

<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <div class="min-h-screen bg-gradient-to-br p-4 md:p-6">
      <UContainer class="max-w-7xl mx-auto">
        <div class="flex gap-4 flex-col lg:flex-row">
          <!-- Main Content Area -->
          <div class="flex-1">
            <UCard class="overflow-hidden">
              <template #header>
                <h2 class="text-lg font-semibold">
                  Video Thumbnail Generator with Media Bunny
                </h2>
              </template>
              <!-- Video Player Section -->
              <div class="py-6">
                <VideoPlayer
                  v-if="selectedFile"
                  :video-source="selectedFile"
                  :edit-mode="editMode"
                  @metadata-loaded="log"
                  @thumbnail-generated="generatedThumbnails.push($event)"
                />

                <VideoPlaceholder v-else />
              </div>
              <!-- File Upload Section -->
              <div class="py-6">
                <div class="flex justify-center mb-4">
                  <input
                    ref="fileInputRef"
                    type="file"
                    id="video-file"
                    accept="video/*"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                  <div class="flex gap-2">
                    <UButton
                      @click="triggerFileInput"
                      size="lg"
                      icon="i-heroicons-folder-open"
                      color="primary"
                    >
                      Choose Video File
                    </UButton>
                    <!-- toggle edit mode -->
                    <UButton
                      @click="toggleEditMode()"
                      size="lg"
                      icon="i-heroicons-pencil"
                      color="primary"
                    >
                      Toggle Edit Mode
                    </UButton>
                  </div>
                </div>

                <div v-if="selectedFile" class="text-center space-y-1">
                  <p class="text-gray-700 dark:text-gray-300">
                    <span class="font-semibold">Selected:</span>
                    {{ selectedFile.name }}
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    <span class="font-semibold">Size:</span>
                    {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
                  </p>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Thumbnails Sidebar -->
          <div class="w-full lg:w-80 xl:w-96">
            <ThumbnailsList :thumbnails="generatedThumbnails" />
          </div>
        </div>
      </UContainer>
    </div>
  </UApp>
</template>
