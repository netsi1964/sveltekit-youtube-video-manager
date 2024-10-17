<script>
  import { onMount } from "svelte";
  import { createFuzzySearch } from "$lib/FuzzySearch.js";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import Tags from "$lib/Tags.svelte";
  import { setError } from "$lib/stores/errorStore.js";
  import { videoStore, setVideos } from "$lib/stores/videoStore.js";

  import { user } from "$lib/stores/userStore";

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
      const aValue = a.snippet ? a.snippet[sortField] : a[sortField];
      const bValue = b.snippet ? b.snippet[sortField] : b[sortField];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);
  }

  $: paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  let mounted = false;

  onMount(() => {
    if ($videoStore.length > 0) {
      initializeFuseSearch();
    }
    loading = false;
    mounted = true;
  });

  function initializeFuseSearch() {
    const options = {
      keys: [
        "snippet.title",
        "snippet.description",
        "snippet.tags",
        "snippet.channelTitle",
        "statistics.viewCount",
        "statistics.likeCount",
      ],
      threshold: 0.4,
    };
    fuse = createFuzzySearch($videoStore, options);
  }

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
      initializeFuseSearch();
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

  function getVideoTags(video) {
    return video.snippet && video.snippet.tags ? video.snippet.tags : [];
  }

  function handleTagChange(video, event) {
    const { tags } = event.detail;
    if (!video.snippet) video.snippet = {};
    video.snippet.tags = tags;
    videoStore.update((videos) =>
      videos.map((v) => (v.id === video.id ? video : v))
    );
  }
</script>

<svelte:head>
  <title>{data.title || "Video Manager"}</title>
</svelte:head>

{$user}
{#if $user}
  <p>Hello, {$user.name}! This is some other page.</p>
{:else}
  <form class="auth-form" method="post" action="?/OAuth2">
    <div>
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        type="submit"
      >
        Login with Google
      </button>
    </div>
  </form>
{/if}

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
      {#if searchTerm}
        <div class="mb-2">
          Matches {filteredVideos.length} of {$videoStore.length}
        </div>
      {/if}
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="px-4 py-2">Thumbnail</th>
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
                on:click={() => handleSort("viewCount")}
              >
                Views {sortField === "viewCount"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("likeCount")}
              >
                Likes {sortField === "likeCount"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("publishedAt")}
              >
                Upload Date {sortField === "publishedAt"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                class="px-4 py-2 cursor-pointer"
                on:click={() => handleSort("publishedAt")}
              >
                Last Updated {sortField === "publishedAt"
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
                  <Tags
                    readOnly={true}
                    tags={getVideoTags(video)}
                    on:change={(event) => handleTagChange(video, event)}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if totalPages > 1}
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
