<script>
  import { onMount } from "svelte";
  import { createFuzzySearch } from "$lib/FuzzySearch.js";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import Tags from "$lib/Tags.svelte";
  import { localChangesCount } from "$lib/stores/localChangesStore.js";
  import { setError } from "$lib/stores/errorStore.js";
  import { videoStore, setVideos } from "$lib/stores/videoStore.js";

  export let data;

  let filteredVideos = [];
  let searchTerm = "";
  let fuse;
  let loading = true;
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let sortField = "title";
  let sortDirection = "asc";
  let error = null;
  let fetchingFromYouTube = false;

  $: {
    if (data.videos && Array.isArray(data.videos)) {
      setVideos(data.videos);
    }
  }

  $: {
    if (fuse && searchTerm) {
      filteredVideos = fuse.search(searchTerm).map((result) => result.item);
    } else {
      filteredVideos = [...$videoStore];
    }

    // Sort the filtered videos
    filteredVideos = filteredVideos.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);
  }

  $: paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(() => {
    if ($videoStore.length > 0) {
      fuse = createFuzzySearch($videoStore);
    }
    loading = false;
  });

  async function fetchVideosFromYouTube() {
    fetchingFromYouTube = true;
    try {
      const response = await fetch("/api/fetch-youtube-videos", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch videos from YouTube");
      }
      const data = await response.json();
      setVideos(data.videos);
      fuse = createFuzzySearch(data.videos);
    } catch (error) {
      setError(error.message);
    } finally {
      fetchingFromYouTube = false;
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "asc";
    }
  }

  function handleRowClick(id) {
    window.location.href = `/edit/${id}`;
  }

  function handleTagChange(video, event) {
    const { tags } = event.detail;
    video.tags = tags;
    videoStore.update((videos) =>
      videos.map((v) => (v.id === video.id ? { ...v, tags } : v))
    );
  }
</script>

<svelte:head>
  <title>{data.title || "Video Manager"}</title>
</svelte:head>

<div class="mt-4">
  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <p class="text-red-500">Error: {error}</p>
  {:else}
    {#if $videoStore.length === 0}
      <p class="text-center mb-4">No videos found.</p>
    {:else}
      <input
        type="text"
        placeholder="Search videos..."
        bind:value={searchTerm}
        class="w-full p-2 border rounded mb-4"
      />
      <div class="mb-2">
        Matches {filteredVideos.length} of {$videoStore.length}
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("title")}
              >
                Title {sortField === "title"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("views")}
              >
                Views {sortField === "views"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("likes")}
              >
                Likes {sortField === "likes"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("uploadDate")}
              >
                Upload Date {sortField === "uploadDate"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("updated")}
              >
                Last Updated {sortField === "updated"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th class="px-4 py-2">Tags</th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedVideos as video (video.id)}
              <tr
                class="hover:bg-gray-100 cursor-pointer"
                on:click={() => handleRowClick(video.id)}
              >
                <td class="border px-4 py-2">{video.title}</td>
                <td class="border px-4 py-2">{video.views.toLocaleString()}</td>
                <td class="border px-4 py-2">{video.likes.toLocaleString()}</td>
                <td class="border px-4 py-2">{video.uploadDate}</td>
                <td class="border px-4 py-2">
                  {new Date(video.updated).toLocaleString()}
                </td>
                <td class="border px-4 py-2">
                  <Tags
                    readOnly={true}
                    bind:tags={video.tags}
                    on:change={(event) => handleTagChange(video, event)}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <button
          on:click={() => currentPage--}
          disabled={currentPage === 1}
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          on:click={() => currentPage++}
          disabled={currentPage === totalPages}
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    {/if}

    <div class="mt-8 text-center">
      <button
        on:click={fetchVideosFromYouTube}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Fetch Videos from YouTube
      </button>
    </div>
  {/if}
</div>

{#if fetchingFromYouTube}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4">Fetching Videos from YouTube</h2>
      <LoadingSpinner />
      <p class="mt-4">Please wait while we retrieve your videos...</p>
    </div>
  </div>
{/if}
