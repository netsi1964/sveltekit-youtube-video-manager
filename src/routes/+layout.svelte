<script>
  import "../app.css";
  import Navigation from "$lib/Navigation.svelte";
  import ErrorHandler from "$lib/ErrorHandler.svelte";
  import { onMount } from "svelte";
  import { setVideos } from "$lib/stores/videoStore.js";

  onMount(async () => {
    try {
      const response = await fetch("/api/videos");
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
      } else {
        console.error("Failed to fetch videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  });
</script>

<ErrorHandler />
<Navigation />

<main class="container mx-auto px-4 py-8">
  <slot />
</main>
