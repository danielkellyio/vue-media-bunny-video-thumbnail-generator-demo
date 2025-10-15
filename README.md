# 🎬 Video Thumbnail Generator

A Nuxt 3 application for generating video thumbnails using Media Bunny and VueUse.

## Features

- 📹 **Video Upload & Playback** - Upload any video file and play it back with native HTML5 controls
- 🎯 **Precise Frame Selection** - Use native video scrubbing to find the perfect frame
- 🖼️ **One-Click Thumbnail Generation** - Extract high-quality thumbnails at current video time with floating overlay button
- 📐 **Smart Aspect Ratio** - Thumbnails automatically match video dimensions while maintaining aspect ratio
- 💾 **Download Support** - Save generated thumbnails as PNG files
- 🎨 **Modern UI** - Clean, minimal design with glassmorphism effects
- ⚡ **Lazy Loading** - Media Bunny only loads when needed (edit mode enabled)
- 🧩 **Modular Architecture** - Separate components for video playback and thumbnail generation

## Tech Stack

- **[Nuxt 3](https://nuxt.com/)** - Vue 3 framework
- **[Media Bunny](https://github.com/mifi/media-bunny)** - Video processing and frame extraction
- **[VueUse](https://vueuse.org/)** - Vue composition utilities (especially `useMediaControls`)
- **TypeScript** - Type-safe development

## Setup

Install dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Component Architecture

The application uses a modular architecture with three main components:

### `VideoPlayerEditor.vue` - Orchestrator Component

A lightweight orchestrator that conditionally renders either VideoPlayer or VideoEditor based on `editMode`.

**Props:**

- `videoSource` (required): File, Blob, or string URL
- `editMode` (optional, default: false): Enable thumbnail extraction UI

**Events:**

- `thumbnail-generated`: Emitted when a thumbnail is generated (only in edit mode)

### `VideoPlayer.vue` - Streamlined Player

A clean, minimal video player for end-user watching without any editing features.

**Props:**

- `videoSource` (required): File, Blob, or string URL

**Events:**

- `metadata-loaded`: Emits video dimensions when metadata loads

### `VideoEditor.vue` - Full Editor Component

Combines VideoPlayer with thumbnail generation capabilities. Uses VideoPlayer as its base and adds a capture overlay.

**Features:**

- Reuses VideoPlayer component for video display
- Integrates Media Bunny for thumbnail generation
- Floating overlay button with glassmorphism design
- Automatic aspect ratio calculation
- Positioned in top-right corner of video

## Component Usage

### Basic Video Player

Use as a simple video player without any Media Bunny overhead:

```vue
<script setup lang="ts">
import VideoPlayerEditor from "./components/VideoPlayerEditor.vue";

const videoFile = ref<File | null>(null);
</script>

<template>
  <VideoPlayerEditor :video-source="videoFile" />
</template>
```

### Video Player with Thumbnail Extraction

Enable edit mode to load the VideoEditor component:

```vue
<script setup lang="ts">
import VideoPlayerEditor from "./components/VideoPlayerEditor.vue";

const videoFile = ref<File | null>(null);

const handleThumbnailGenerated = (data) => {
  console.log("Thumbnail generated:", data);
  // data.canvas - HTMLCanvasElement
  // data.timestamp - Frame timestamp in seconds
  // data.dataUrl - Base64 data URL for immediate use
};
</script>

<template>
  <VideoPlayerEditor
    :video-source="videoFile"
    :edit-mode="true"
    @thumbnail-generated="handleThumbnailGenerated"
  />
</template>
```

> **Note:** When `editMode` is enabled, the `VideoEditor` component is rendered, which integrates Media Bunny for thumbnail generation. The editor component reuses the `VideoPlayer` component as its base for consistent video playback.

## Key Features

### VueUse Integration

The component uses VueUse's [`useMediaControls`](https://vueuse.org/core/useMediaControls/) composable for reactive video state:

- Reactive `currentTime` and `duration` tracking
- Automatic video state synchronization
- Loading state detection
- Works seamlessly with native HTML5 video controls

### Media Bunny Integration

Media Bunny provides powerful video processing capabilities and is **lazy-loaded** for optimal performance:

- **On-Demand Loading**: Only loaded when edit mode is enabled
- **Support for All Formats**: Works with any video format
- **Frame-Accurate Extraction**: Precise thumbnail generation at any timestamp
- **Efficient Canvas Rendering**: High-quality output with minimal overhead
- **Automatic Decoding**: Handles video decoding automatically

The component architecture ensures that:

- The base VideoPlayer remains lightweight and focused on playback
- VideoEditor only renders when edit mode is enabled
- Media Bunny integration is isolated to the VideoEditor component
- Users who just want to watch videos get a clean, streamlined experience

## Production

Build the application for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## License

MIT
