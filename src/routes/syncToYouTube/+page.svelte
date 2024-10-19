<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import {
    localChanges,
    updateLocalChanges,
    localChangesCount,
  } from "$lib/stores/localChangesStore.js";
  import { setError } from "$lib/stores/errorStore.js";
  import Tags from "$lib/Tags.svelte";

  let selectedVideos = {};
  let isSyncing = false;
  let currentVideo = "";
  let progress = 0;
  let totalVideos = 0;
  let currentVideoIndex = 0;
  let syncComplete = false;
  let syncedVideosCount = 0;
  let syncDuration = 0;

  onMount(async () => {
    await updateLocalChanges();
  });

  async function fetchLocalChanges() {
    try {
      await updateLocalChanges();
      console.log("Fetched local changes:", $localChanges);
    } catch (error) {
      console.error("Error fetching local changes:", error);
      setError("Failed to load local changes");
    }
  }

  async function syncToYouTube() {
    isSyncing = true;
    syncComplete = false;
    const videosToSync = $localChanges.filter(
      (video) => selectedVideos[video.id]
    );
    syncedVideosCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < videosToSync.length; i++) {
      if (!isSyncing) break; // Check if syncing was cancelled
      currentVideo = videosToSync[i].snippet?.title || videosToSync[i].id;
      currentVideoIndex = i + 1;
      const success = await simulateSyncToYouTube(videosToSync[i]);
      if (success) {
        await removeFromLocalChanges(videosToSync[i].id);
        syncedVideosCount++;
      }
      progress = ((i + 1) / videosToSync.length) * 100;
    }

    syncDuration = Math.round((Date.now() - startTime) / 1000);
    syncComplete = true;
    isSyncing = false;
    currentVideo = "";
    progress = 0;
    currentVideoIndex = 0;
  }

  async function simulateSyncToYouTube(video) {
    // Simulate API call to sync video to YouTube
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`Synced video ${video.snippet?.title || video.id} to YouTube`);
    return true; // Assume success for this simulation
  }

  async function removeFromLocalChanges(videoId) {
    try {
      const response = await fetch(`/api/local-changes/${videoId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove video from local changes");
      }
      await fetchLocalChanges(); // Refresh the local changes after removal
    } catch (error) {
      console.error("Error removing video from local changes:", error);
    }
  }

  function cancelSync() {
    isSyncing = false;
  }

  async function closeSyncModal() {
    syncComplete = false;
    await fetchLocalChanges(); // Reload local changes after closing the modal
  }

  function getVideoTags(video) {
    return video.snippet && video.snippet.tags ? video.snippet.tags : [];
  }
</script>

<svelte:head>
  <title>Sync Videos to YouTube</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Sync Videos to YouTube</h1>

  {#if $localChangesCount > 0}
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr>
            <th class="px-4 py-2">Select</th>
            <th class="px-4 py-2">Thumbnail</th>
            <th class="px-4 py-2">Title</th>
            <th class="px-4 py-2">Views</th>
            <th class="px-4 py-2">Likes</th>
            <th class="px-4 py-2">Upload Date</th>
            <th class="px-4 py-2">Last Updated</th>
            <th class="px-4 py-2">Tags</th>
          </tr>
        </thead>
        <tbody>
          {#each $localChanges as video (video.id)}
            <tr class="hover:bg-gray-100">
              <td class="border px-4 py-2">
                <input
                  type="checkbox"
                  bind:checked={selectedVideos[video.id]}
                  class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td class="border px-4 py-2">
                <img
                  src={video.snippet?.thumbnails?.default?.url || ""}
                  alt={video.snippet?.title || "No title"}
                  width="120"
                  height="90"
                  class="object-cover"
                />
              </td>
              <td class="border px-4 py-2"
                >{video.snippet?.title || "No title"}</td
              >
              <td class="border px-4 py-2"
                >{video.statistics?.viewCount?.toLocaleString() || "N/A"}</td
              >
              <td class="border px-4 py-2"
                >{video.statistics?.likeCount?.toLocaleString() || "N/A"}</td
              >
              <td class="border px-4 py-2"
                >{video.snippet?.publishedAt || "N/A"}</td
              >
              <td class="border px-4 py-2">
                {video.snippet?.publishedAt
                  ? new Date(video.snippet.publishedAt).toLocaleString()
                  : "N/A"}
              </td>
              <td class="border px-4 py-2">
                <Tags readOnly={true} tags={getVideoTags(video)} />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex justify-center">
      <button
        on:click={syncToYouTube}
        disabled={isSyncing}
        class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sync to YouTube
      </button>
    </div>

    {#if isSyncing || syncComplete}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        transition:fade
      >
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          {#if isSyncing}
            <h2 class="text-2xl font-bold mb-4">Syncing to YouTube</h2>
            <p class="mb-2">Current video: {currentVideo}</p>
            <div
              class="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-700"
            >
              <div
                class="bg-blue-600 h-2.5 rounded-full"
                style="width: {progress}%"
              ></div>
            </div>
            <p class="text-center text-sm text-gray-600 mb-4">
              {currentVideoIndex} of {$localChanges.filter(
                (v) => selectedVideos[v.id]
              ).length}
            </p>
            <button
              on:click={cancelSync}
              class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
          {:else if syncComplete}
            <h2 class="text-2xl font-bold mb-4 text-green-600">
              Sync Complete
            </h2>
            <p class="mb-4 text-center">
              Successfully synced {syncedVideosCount} video{syncedVideosCount !==
              1
                ? "s"
                : ""} in {syncDuration} seconds
            </p>
            <button
              on:click={closeSyncModal}
              class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
            >
              Okay
            </button>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
    <p class="text-center text-gray-500 mt-8">No local changes found.</p>
  {/if}
</div>

<style>
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
</style>
