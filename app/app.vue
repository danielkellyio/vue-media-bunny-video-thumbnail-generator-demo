<script setup lang="ts">
import { ref } from "vue";
import VideoPlayer from "./components/VideoPlayer.vue";

const selectedFile = ref<File | null>(null);
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
  <div class="app">
    <NuxtRouteAnnouncer />

    <div class="container">
      <header class="header">
        <h1>🎬 Video Thumbnail Generator</h1>
        <p>Upload a video file and generate thumbnails at any timestamp</p>
      </header>

      <div class="file-upload-section">
        <div class="file-input-container">
          <input
            type="file"
            id="video-file"
            accept="video/*"
            @change="handleFileSelect"
            class="file-input"
          />
          <label for="video-file" class="file-input-label">
            📁 Choose Video File
          </label>
        </div>

        <div v-if="selectedFile" class="file-info">
          <p><strong>Selected:</strong> {{ selectedFile.name }}</p>
          <p>
            <strong>Size:</strong>
            {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
          </p>
        </div>
      </div>

      <div v-if="selectedFile" class="extractor-section">
        <VideoPlayer
          :video-source="selectedFile"
          :edit-mode="true"
          @thumbnail-generated="handleThumbnailGenerated"
        />
      </div>

      <div v-if="generatedThumbnails.length > 0" class="thumbnails-section">
        <h2>Generated Thumbnails</h2>
        <div class="thumbnails-grid">
          <div
            v-for="(thumbnail, index) in generatedThumbnails"
            :key="index"
            class="thumbnail-item"
          >
            <img
              :src="thumbnail.dataUrl"
              :alt="`Thumbnail at ${thumbnail.timestamp}s`"
            />
            <div class="thumbnail-meta">
              <p>
                <strong>Timestamp:</strong>
                {{ thumbnail.timestamp.toFixed(2) }}s
              </p>

              <button
                @click="
                  downloadThumbnail(thumbnail.dataUrl, thumbnail.timestamp)
                "
                class="download-btn"
              >
                📥 Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.file-upload-section {
  padding: 30px 20px;
  border-bottom: 1px solid #e9ecef;
}

.file-input-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.file-input-label {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.file-input-label:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.file-info {
  text-align: center;
  color: #666;
}

.file-info p {
  margin: 5px 0;
}

.extractor-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.thumbnails-section {
  padding: 30px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.thumbnails-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.thumbnail-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.thumbnail-item:hover {
  transform: translateY(-2px);
}

.thumbnail-item img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 10px;
}

.thumbnail-meta {
  text-align: center;
}

.thumbnail-meta p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.download-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background: #218838;
}

/* Responsive design */
@media (max-width: 768px) {
  .app {
    padding: 10px;
  }

  .header h1 {
    font-size: 2rem;
  }

  .thumbnails-grid {
    grid-template-columns: 1fr;
  }
}
</style>
