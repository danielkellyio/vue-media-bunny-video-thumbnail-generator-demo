# Video Thumbnail Generator Vue Component with MediaBunny

## Introduction

Building a video thumbnail generator might sound like a complex task requiring server-side infrastructure, but with modern browser APIs and powerful libraries like MediaBunny, we can create a fully client-side solution that's fast, private, and cost-effective.

In this tutorial, we'll walk through building a complete video thumbnail generator application using **Vue 3's Composition API**, **MediaBunny** for video processing, and **VueUse** for reactive media controls.

![Video Thumbnail Generator Demo](./images/extract-thumbnails-example.gif)

👉 You can [view a live demo of the application here](https://media-bunny-vue-demo.netlify.app/).

The application allows users to:

- Upload and play video files with native HTML5 controls
- Scrub through video to find the perfect frame
- Extract high-quality thumbnails at any timestamp with one click
- Download generated thumbnails as PNG files
- Toggle between view and edit modes without interrupting playback

**Tech Stack:**
To build the project, I've used the following tools:

- [**Nuxt 3**](https://vueschool.io/courses/nuxt-js-3-fundamentals) - Modern Vue 3 framework with great DX
- [**MediaBunny**](https://mediabunny.dev) - Browser-based video processing library
- [**VueUse**](https://vueschool.io/courses/vueuse-for-everyone) - Collection of Vue Composition utilities
- [**TypeScript**](https://vueschool.io/courses/typescript-fundamentals) - Type-safe development
- [**Nuxt UI**](https://vueschool.io/courses/nuxt-ui-build-a-dashboard-template) - Beautiful component library built on Tailwind CSS

The beauty of this approach is that all video processing happens in the browser—no server-side infrastructure needed, no uploads required, and complete privacy for users' video content.

## Real-World Use Cases for Video Thumbnail Generation

Before diving into the code, let's explore a few use cases for video thumbnail generation.

### Why Video Thumbnails Matter

Video thumbnails are the first impression users get of your video content. They significantly impact:

- **Click-through rates**: A compelling thumbnail can increase views by 2-10x
- **User engagement**: Thumbnails help users quickly scan and find relevant content
- **Professional appearance**: Auto-generated thumbnails that aren't just the first frame can elevate the quality of your platform

### Common Use Cases

Some common use cases that you might need to generate thumbnails for are:

- Video platforms that allow users to upload videos
- Content management systems where editors need to quickly add thumbnails to video content
- Video editing tools (even AI powered ones)
- Email marketing campaigns where videos can't actually be embedded and need a static thumbnail
- and more!

### Why Client-Side Generation?

Processing videos client-side offers significant advantages:

- **Reduced Server Costs**: No need for expensive GPU instances or video processing infrastructure
- **Instant Results**: Users see thumbnails immediately without upload/processing queues
- **Privacy**: Sensitive videos stay on the user's device—never transmitted to servers
- **Bandwidth Savings**: Generate thumbnails without uploading full video files
- **Better UX**: Users can scrub through video and pick the exact frame they want in real-time

## Understanding MediaBunny: Complete Media Toolkit

Are you ready to start building? Hold up, first let's understand the library that makes this all possible.

### What is MediaBunny?

[MediaBunny](https://mediabunny.dev) is a comprehensive JavaScript library for reading, writing, and converting video and audio files—all directly in the browser. The library's tagline says it all: "faster than anybunny else." (😂 they said "anybunny")

Unlike traditional approaches that require server-side processing with tools like FFmpeg, MediaBunny brings professional-grade video processing capabilities to the browser using WebAssembly and modern web APIs.

### Why MediaBunny is Powerful

**Zero Server Infrastructure**  
All processing happens client-side, eliminating the need for video processing servers, reducing operational costs, and removing latency from upload/download cycles.

**Format Flexibility**  
MediaBunny supports a wide range of video and audio formats and codecs. Whether your users upload MP4, WebM, MOV, or other formats, MediaBunny can handle them.

**Frame-Accurate Control**  
Extract frames at precise timestamps down to the millisecond. This is crucial for professional applications where timing matters.

**Privacy-First Architecture**  
Video files never leave the user's browser. This is essential for applications dealing with sensitive content—medical videos, legal evidence, private communications, etc.

**Rich Feature Set**  
One library handles reading, writing, and converting media files. No need to cobble together multiple libraries for different operations.

### MediaBunny Capabilities Beyond Thumbnails

While we're focusing on thumbnail generation, MediaBunny can also do much more. Here are some more of the capabilities that you can use:

- **Reading Media Files**: Parse and analyze video/audio metadata, tracks, and streams
- **Writing Media Files**: Create and encode new video/audio files with custom settings
- **Media Conversion**: Convert between different formats and codecs entirely in the browser
- **Media Sinks**: Multiple output targets including Canvas, ImageData, and raw frame data
- **Media Sources**: Support for various input types (File, Blob, ArrayBuffer, URLs)
- **Packets & Samples**: Low-level access to encoded and decoded media data for advanced use cases
- **Extensions**: Expandable architecture with additional encoders like `@mediabunny/mp3-encoder`

**Other Use Cases for MediaBunny:**

Such a great arsenal of capabilities! Use them for usecases such as:

- Video preview generation (sprite sheets, animated GIFs)
- Client-side video editing and trimming
- Format conversion tools (no server needed!)
- Video analysis and metadata extraction
- Custom video players with advanced scrubbing
- Video compression and optimization
- Audio extraction from video files

We dare you to take what you learn in this article and expand on it with MediaBunny's other powerful capabilities!

## Building It Step by Step

Ok, now down to business. Let's build this application starting simple and build up the features together.

### Step 0: Project Setup & Dependencies

First, let's set up a Nuxt 3 project and install our key dependencies:

```bash
npm create nuxi@latest video-thumbnail-generator
cd video-thumbnail-generator
pnpm install mediabunny @vueuse/core @vueuse/nuxt @nuxt/ui
```

Here's what each dependency does:

**`mediabunny` (v1.23.0)**  
Handles all video processing, frame extraction, and thumbnail generation—everything we need for browser-based video manipulation.

**`@vueuse/core` & `@vueuse/nuxt` (v13.9.0)**  
Collection of Vue Composition utilities. We'll use `useMediaControls` for reactive video state and `useEventListener` for clean event handling.

**`@nuxt/ui` (v4.0.1)**  
Beautiful component library for our UI (buttons, cards, etc.).

### Step 1: Start with a Basic Video Player

Let's start simple, with support for selecting and playing a video file.

```html
<!-- app/app.vue -->
<script setup lang="ts">
  import { ref } from "vue";

  const selectedFile = ref<File | null>(null);
  const videoUrl = ref<string>("");

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      selectedFile.value = file;
      // Revoke previous URL if it exists
      if (videoUrl.value) {
        URL.revokeObjectURL(videoUrl.value);
      }
      videoUrl.value = URL.createObjectURL(file);
    }
  };
</script>

<template>
  <div class="p-4">
    <input type="file" accept="video/*" @change="handleFileSelect" />

    <video v-if="videoUrl" :src="videoUrl" controls class="w-full mt-4" />
  </div>
</template>
```

**What's happening here?**

- **File input** lets users select a video
- **`URL.createObjectURL(file)`** creates a temporary blob URL for the video
- **Proper cleanup** revokes old URLs to prevent memory leaks
- **Conditional rendering** only shows video when a file is selected

Test it out—you now have a working video player!

![Video Player Demo](./images/simple-player-demo.gif)

### Step 2: Extract into a Reusable VideoPlayer Component

As developers, we want reusable components. Let's extract the video player logic into a reusable component.

```html
<!-- app/components/VideoPlayer.vue -->
<script setup lang="ts">
  import { ref, watch } from "vue";

  const props = defineProps<{
    videoSource: File | Blob | string;
  }>();

  const videoUrl = ref<string>("");

  const initializeVideo = () => {
    if (!props.videoSource) return;

    if (typeof props.videoSource === "string") {
      videoUrl.value = props.videoSource;
    } else {
      if (videoUrl.value && videoUrl.value.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl.value);
      }
      videoUrl.value = URL.createObjectURL(props.videoSource);
    }
  };

  watch(() => props.videoSource, initializeVideo, { immediate: true });
</script>

<template>
  <div class="relative bg-black rounded-lg overflow-hidden">
    <video :src="videoUrl" class="w-full h-auto" controls preload="metadata" />
  </div>
</template>
```

Now update `app.vue` to use the component:

```html
<!-- app/app.vue -->
<script setup lang="ts">
  import { ref } from "vue";

  const selectedFile = ref<File | null>(null);

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) selectedFile.value = file;
  };
</script>

<template>
  <div class="p-4">
    <input type="file" accept="video/*" @change="handleFileSelect" />

    <VideoPlayer v-if="selectedFile" :video-source="selectedFile" />
  </div>
</template>
```

This works exactly as before, but now we have a reusable component that we can use in other parts of our application!

### Step 3: Add VueUse for Reactive Video Controls

Now let's integrate VueUse's `useMediaControls` to get reactive access to video state. This will be helpful especially for getting the current time of the video for thumbnail generation:

```html
<!-- app/components/VideoPlayer.vue -->
<script setup lang="ts">
  import { ref, watch } from "vue";
  import { useMediaControls } from "@vueuse/core";

  const props = defineProps<{
    videoSource: File | Blob | string;
  }>();

  const videoRef = ref<HTMLVideoElement>();
  const videoUrl = ref<string>("");

  // Get reactive video state
  const { currentTime, playing } = useMediaControls(videoRef, {
    src: videoUrl,
  });

  const initializeVideo = () => {
    if (!props.videoSource) return;

    if (typeof props.videoSource === "string") {
      videoUrl.value = props.videoSource;
    } else {
      if (videoUrl.value && videoUrl.value.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl.value);
      }
      videoUrl.value = URL.createObjectURL(props.videoSource);
    }
  };

  watch(() => props.videoSource, initializeVideo, { immediate: true });
</script>

<template>
  <div class="relative bg-black rounded-lg overflow-hidden">
    <video ref="videoRef" class="w-full h-auto" controls preload="metadata" />

    <!-- Debug: show current time -->
    <div class="text-white p-2">{{ currentTime.toFixed(2) }}s</div>
  </div>
</template>
```

**What did VueUse give us?**

In this case, only `currentTime` is used, but `duration`, `playing`, and other properties are also available. Best of all, they are fully reactive and will update as the video plays! 🎉

([For more information on useing VueUse with Media, checkout our full video tutorial.](https://vueschool.io/lessons/media-and-vueuse))

### Step 4: Add MediaBunny for Thumbnail Extraction

Now for the exciting part, let's add thumbnail generation! We'll start by adding it directly in the component to understand how it works, then we'll extract it into a composable for reuse.

First, let's add a basic type for our use:

```typescript
// app/types/index.ts
export interface ThumbnailGeneratedData {
  canvas: HTMLCanvasElement;
  timestamp: number;
  dataUrl: string;
}
```

Now we'll create a VideoEditor component that handles thumbnail extraction. It's quite a chunk of code, but we've commented it well so you can understand what's happening.

```html
<!-- app/components/VideoEditor.vue -->
<script setup lang="ts">
  import { ref, watch } from "vue";
  import { useEventListener } from "@vueuse/core";
  import { Input, ALL_FORMATS, BlobSource, CanvasSink } from "mediabunny";

  const props = defineProps<{
    // Take in the HTML video element so that we can use the same video element for both the VideoPlayer and VideoEditor
    // This is a key architectural decision that we'll discuss later
    videoElement: HTMLVideoElement | undefined | null;
  }>();

  // Define an event to emit the thumbnail data to the parent component after we've generated it
  const emit = defineEmits<{
    "thumbnail-generated": [
      data: {
        canvas: HTMLCanvasElement;
        timestamp: number;
        dataUrl: string;
      }
    ];
  }>();

  const isReady = ref(false); // Whether MediaBunny is ready to extract thumbnails
  const isProcessing = ref(false); // Whether we're currently generating a thumbnail
  const error = ref<string | null>(null); // Whether we've encountered an error during generation or initialization of MediaBunny
  const videoTrack = ref<any>(null); // The video track that we're using to extract thumbnails (will be null until MediaBunny is ready)
  const sink = ref<any>(null); // The sink that we're using to extract thumbnails (will alo be null until MediaBunny is ready)
  // What is a sink?
  // It's a destination for the video data that we're extracting. In this case, we're using a CanvasSink to extract the video frames to a canvas.

  // Initialize MediaBunny (called when video metadata loads)
  const initializeMediaBunny = async () => {
    // get the video HTML element
    const videoEl = props.videoElement;
    if (!videoEl) return;

    // get the video source
    const source = videoEl.querySelector("source")?.src || videoEl.src;
    if (!source) return;

    try {
      // Fetch the video as a blob
      const response = await fetch(source);
      const sourceBlob = await response.blob();

      // Create MediaBunny Input
      // Input is the main entry point for MediaBunny read operations
      const input = new Input({
        formats: ALL_FORMATS,
        source: new BlobSource(sourceBlob),
      });

      // Get the primary video track
      // Why? Because video files can have multiple tracks (video, audio, subtitles)
      // We want the primary video
      const track = await input.getPrimaryVideoTrack();
      if (!track) throw new Error("No video track found");

      // Check if we can decode it
      //
      const decodable = await track.canDecode();
      if (!decodable) throw new Error("Video track cannot be decoded");

      videoTrack.value = track;

      // Create a CanvasSink for extracting frames
      // What is a CanvasSink?
      // It's a destination for the video data that we're extracting.
      // In this case, we're using a CanvasSink to extract the video frames to an HTML5 canvas.
      sink.value = new CanvasSink(track, {
        width: videoEl.videoWidth,
      });

      // now we're ready to extract thumbnails!
      isReady.value = true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Error initializing MediaBunny";
      console.error("MediaBunny error:", err);
    }
  };

  // Now we watch for video element and initialize MediaBunny when it's loaded
  useEventListener(
    () => props.videoElement,
    "loadedmetadata",
    initializeMediaBunny
  );

  // Or if the video element is already loaded, initialize MediaBunny immediately
  if (props.videoElement) initializeMediaBunny();

  // Isn't MediaBunny easy? 🤯

  // Now let's create a function to generate the thumbnail
  const handleCapture = async () => {
    // Sanity check to make sure we have a sink and a video element
    if (!sink.value || !props.videoElement) return;

    try {
      // Set the processing state to true
      isProcessing.value = true;
      // and clear any previous errors
      error.value = null;

      const currentTime = props.videoElement.currentTime;

      // Extract frame at current timestamp
      const result = await sink.value.getCanvas(currentTime);
      if (!result) throw new Error("Failed to generate thumbnail");

      // Create our own canvas
      // To draw the thumbnail and return the data URL
      const canvas = document.createElement("canvas");
      canvas.width = props.videoElement.videoWidth;
      canvas.height = props.videoElement.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      // Draw the frame
      ctx.drawImage(result.canvas, 0, 0);

      // Emit the thumbnail data
      emit("thumbnail-generated", {
        canvas,
        timestamp: result.timestamp,
        dataUrl: canvas.toDataURL("image/png"),
      });
    } catch (err) {
      error.value = "Error generating thumbnail";
      console.error(err);
    } finally {
      isProcessing.value = false;
    }
  };
</script>

<template>
  <div class="absolute top-0 right-0 p-2.5 z-10">
    <button
      @click="handleCapture"
      :disabled="isProcessing || !isReady"
      class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {{ isProcessing ? "Generating..." : "Capture" }}
    </button>

    <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
  </div>
</template>
```

Whew, that was a lot of code! [But most of it is almost a copy/paste from the MediaBunny documentation.](https://mediabunny.dev/guide/quick-start#extract-video-thumbnails)

**Understanding the MediaBunny Flow:**

Let's break down the MediaBunny Flow in simple terms here if you didn't catch it all via the code.

1. **Fetch the video** as a Blob from the video element's src
2. **Create an Input** with `BlobSource` - this is MediaBunny's entry point
3. **Get the video track** - videos can have multiple tracks (video, audio, subtitles)
4. **Check decodability** - ensure the codec is supported
5. **Create a CanvasSink** - this renders video frames to canvas
6. **Extract frames** with `getCanvas(timestamp)` - frame-accurate extraction!
7. **Draw the frame to a canvas** - here we specify our final dimensions and generate a data URL
8. **Emit the thumbnail data** - So the parent component can use it however it likes

Now let's integrate the VideoEditor component into VideoPlayer:

```html
<!-- app/components/VideoPlayer.vue -->
<script setup lang="ts">
  // ... everything else is the same as before
  //except...

  const props = defineProps<{
    //... we're adding a new prop here...
    editMode?: boolean;
  }>();

  // ... and a new event to emit the thumbnail data
  const emit = defineEmits<{
    "thumbnail-generated": [data: any];
  }>();
</script>

<template>
  <div class="relative bg-black rounded-lg overflow-hidden">
    <video ref="videoRef" class="w-full h-auto" controls preload="metadata" />

    <!-- 
    Here we conditionally render VideoEditor when in edit mode
    It's lazy loaded so that user's only watching the video don't have to load the VideoEditor component
    (Note the Lazy prefix is a Nuxt convention for lazy loading components, in Vue you could use defineAsyncComponent instead)
     -->
    <LazyVideoEditor
      v-if="editMode"
      :video-element="videoRef"
      @thumbnail-generated="emit('thumbnail-generated', $event)"
    />
  </div>
</template>
```

**Key architectural decision here:**

Both VideoPlayer and VideoEditor use the same `<video>` DOM element (notice the videoRef passed down as a prop to the VideoEditor). This means toggling edit mode on/off doesn't restart the video, and playback continues seamlessly!

Now let's update app.vue to test it:

```html
<!-- app/app.vue -->
<script setup lang="ts">
  import { ref } from "vue";

  const selectedFile = ref<File | null>(null);
  const editMode = ref(true); // Enable edit mode
  const thumbnail = ref<string | null>(null);

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) selectedFile.value = file;
  };

  const handleThumbnailGenerated = (data: any) => {
    console.log("Thumbnail generated at", data.timestamp, "seconds");
    console.log("Data URL:", data.dataUrl);
    thumbnail.value = data.dataUrl;
  };
</script>

<template>
  <div class="p-4">
    <input type="file" accept="video/*" @change="handleFileSelect" />

    <VideoPlayer
      v-if="selectedFile"
      :video-source="selectedFile"
      :edit-mode="editMode"
      @thumbnail-generated="handleThumbnailGenerated"
    />
    <img v-if="thumbnail" :src="thumbnail" class="w-full rounded" />
  </div>
</template>
```

Try it out! Load a video, scrub to a frame you like, and click "Capture". The thumbnail will be displayed below the video!

### Step 5: Extract Logic into a Reusable Composable

The VideoEditor component works, but all that MediaBunny logic would be hard to reuse. Let's extract it into [a composable, Vue's pattern for reusable stateful logic](https://vueschool.io/courses/vue-composables). But why?

- **Reusability**: Any component can use `useVideoThumbnail`
- **Testability**: Logic is separated from UI
- **Clean Code**: VideoEditor stays focused on UI

First, let's add the necessary types:

```typescript
// app/types/index.ts
import type { Ref } from "vue";

export interface ThumbnailGeneratedData {
  canvas: HTMLCanvasElement;
  timestamp: number;
  dataUrl: string;
}

export interface UseVideoThumbnailOptions {
  videoElement: Ref<HTMLVideoElement | undefined | null>;
}

export interface UseVideoThumbnailReturn {
  isProcessing: Ref<boolean>;
  isReady: Ref<boolean>;
  error: Ref<string | null>;
  videoTrack: Ref<any>;
  sink: Ref<any>;
  generateThumbnail: () => Promise<ThumbnailGeneratedData | null>;
}
```

Now create the composable that extracts all that MediaBunny logic (it's mostly the same as before)

```typescript
// app/composables/useVideoThumbnail.ts
import { ref, onUnmounted } from "vue";
import { useEventListener } from "@vueuse/core";
import { Input, ALL_FORMATS, BlobSource, CanvasSink } from "mediabunny";
import type {
  UseVideoThumbnailOptions,
  UseVideoThumbnailReturn,
  ThumbnailGeneratedData,
} from "../types";

export function useVideoThumbnail(
  options: UseVideoThumbnailOptions
): UseVideoThumbnailReturn {
  const { videoElement } = options;

  // Reactive state
  // this is all the same....
  const isReady = ref(false);
  // etc...

  const initializeMediaBunny = async () => {
    // same as before...
  };

  // Generate thumbnail at current time
  const generateThumbnail =
    async (): Promise<ThumbnailGeneratedData | null> => {
      // same as before...
    };

  // event listener setup/ bunny init is the same...

  // Now we clean up on unmounted though for a safer solution (no memory leaks!)
  onUnmounted(() => {
    // Clean up canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clean up MediaBunny resources
    videoTrack.value = null;
    sink.value = null;
  });

  // return the state and the generateThumbnail function for use in the component
  return {
    isProcessing,
    isReady,
    error,
    videoTrack,
    sink,
    generateThumbnail,
  };
}
```

Lastly, we'll update VideoEditor to use the composable (it's now much simpler):

```html
<!-- app/components/VideoEditor.vue -->
<script setup lang="ts">
  import { computed } from "vue";
  import { useVideoThumbnail } from "../composables/useVideoThumbnail";

  const props = defineProps<{
    videoElement: HTMLVideoElement | undefined | null;
  }>();

  const emit = defineEmits<{
    "thumbnail-generated": [data: any];
  }>();

  const videoElementRef = computed(() => props.videoElement);

  // Use the composable - all MediaBunny logic is handled!
  const { isProcessing, error, generateThumbnail, isReady } = useVideoThumbnail(
    {
      videoElement: videoElementRef,
    }
  );

  const handleCapture = async () => {
    const result = await generateThumbnail();
    if (result) emit("thumbnail-generated", result);
  };
</script>

<template>
  <div class="absolute top-0 right-0 p-2.5 z-10">
    <button
      @click="handleCapture"
      :disabled="isProcessing || !isReady"
      class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {{ isProcessing ? "Generating..." : "Capture" }}
    </button>

    <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
  </div>
</template>
```

Look how much simpler! The component went from ~130 lines to ~40 lines. All the MediaBunny complexity is now in the reusable composable.

### Step 6: Store and Display Thumbnails

Now let's collect all the thumbnails we generate and display them in a sidebar. Update `app.vue`:

```html
<!-- app/app.vue -->
<script setup lang="ts">
  // ... everything else is the same as before ...
  import type { ThumbnailGeneratedData } from "../types";
  const generatedThumbnails = ref<Array<ThumbnailGeneratedData>>([]);
  // Push new thumbnails into the array
  const handleThumbnailGenerated = (data: any) => {
    generatedThumbnails.value.push(data);
  };
</script>

<template>
  <div class="p-4 flex gap-4">
    <!-- Main area -->
    <div class="flex-1">
      <!-- ... everything else is the same as before ... -->
      <VideoPlayer
        v-if="selectedFile"
        :video-source="selectedFile"
        :edit-mode="editMode"
        @thumbnail-generated="handleThumbnailGenerated"
      />
    </div>

    <!-- Thumbnails sidebar -->
    <div class="w-80">
      <h3>Generated Thumbnails ({{ generatedThumbnails.length }})</h3>
      <div v-for="(thumb, index) in generatedThumbnails" :key="index">
        <img :src="thumb.dataUrl" />
        <p>{{ thumb.timestamp.toFixed(2) }}s</p>
      </div>
    </div>
  </div>
</template>
```

### Step 7: Add Download Functionality

Let's also make the thumbnails downloadable and create a ThumbnailCard component to encapsulate that logic and markup:

```html
<!-- app/components/ThumbnailCard.vue -->
<script setup lang="ts">
  const props = defineProps<{
    thumbnail: {
      dataUrl: string;
      timestamp: number;
    };
  }>();

  const downloadThumbnail = () => {
    const link = document.createElement("a");
    link.download = `thumbnail-${props.thumbnail.timestamp.toFixed(2)}s.png`;
    link.href = props.thumbnail.dataUrl;
    link.click();
  };
</script>

<template>
  <div class="group relative">
    <img :src="thumbnail.dataUrl" class="w-full rounded" />

    <!-- Show download button on hover -->
    <button
      @click="downloadThumbnail"
      class="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
    >
      Download PNG
    </button>

    <p class="text-sm text-gray-600 mt-1">
      {{ thumbnail.timestamp.toFixed(2) }}s
    </p>
  </div>
</template>
```

**How download works:**

1. Create an `<a>` element
2. Set `href` to the data URL (base64-encoded PNG)
3. Set `download` attribute with a filename
4. Programmatically click it

The browser downloads the image—no server needed!

Update app.vue to use ThumbnailCard:

```html
<div v-for="(thumb, index) in generatedThumbnails" :key="index">
  <ThumbnailCard :thumbnail="thumb" />
</div>
```

### Step 8: Polish the UI (Optional)

At this point, you have a fully functional thumbnail generator! Here are some optional enhancements:

**Add a toggle for edit mode:**

```html
<button @click="editMode = !editMode" class="px-4 py-2 bg-gray-200 rounded">
  {{ editMode ? "View Mode" : "Edit Mode" }}
</button>
```

**Add Nuxt UI components** for a polished look (as seen in the final demo):

```bash
pnpm add @nuxt/ui
```

Then use `UButton`, `UCard`, and other components to elevate the design.

You can view how I integrated [Nuxt UI components in the source code for the final demo here](https://github.com/danielkellyio/vue-media-bunny-video-thumbnail-generator-demo).

## Congrats! You did it!

You've built a production-ready video thumbnail generator using Vue 3 and MediaBunny! The application demonstrates:

✅ Client-side video processing without servers  
✅ Frame-accurate thumbnail extraction  
✅ Seamless edit mode toggling  
✅ Clean, type-safe architecture  
✅ Reactive state management  
✅ Shared DOM element between components
✅ Lazy loading of editor to improve performance
✅ Seperation of concerns between components and composables
✅ Proper resource cleanup
