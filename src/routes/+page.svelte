<script>
  import { onMount } from "svelte";
  import Fuse from "fuse.js";
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
    if (data.user) {
      $user = data.user;
      console.log("Current user:", $user.name); // Log the user's name for debugging
    }
    if (data.videos) {
      setVideos(data.videos);
    }
  }

  onMount(() => {
    if ($videoStore.length > 0) {
      initializeFuseSearch();
    }
    loading = false;
  });

  $: {
    if ($videoStore.length > 0 && !fuse) {
      initializeFuseSearch();
    }

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
      includeScore: true,
    };
    fuse = new Fuse($videoStore, options);
  }

  function handleSearch() {
    if (fuse && searchTerm) {
      filteredVideos = fuse.search(searchTerm).map((result) => result.item);
    } else {
      filteredVideos = [...$videoStore];
    }
    currentPage = 1;
  }

  async function fetchVideosFromYouTube() {
    fetchingFromYouTube = true;
    try {
      if (!$user || !$user.accessToken) {
        throw new Error("User not authenticated");
      }
      const response = await fetch("/api/youtube-videos", {
        headers: {
          Authorization: `Bearer ${$user.accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch videos from YouTube: ${errorData.error}`
        );
      }
      const data = await response.json();
      setVideos(data.videos);
      initializeFuseSearch();
    } catch (error) {
      setError(error.message);
      console.error("Error fetching YouTube videos:", error);
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

  function handleRowClick(videoId) {
    window.location.href = `/edit/${videoId}`;
  }

  function getVideoTags(video) {
    return video.snippet?.tags || [];
  }

  function handleTagChange(video, event) {
    // Implement tag change logic here
  }
</script>

<svelte:head>
  <title>{data.title || "Video Manager"}</title>
</svelte:head>

<div class="mt-4">
  {#if loading}
    <LoadingSpinner />
  {:else if !$user}
    <div class="text-center">
      <p class="text-xl mb-4">Please log in to view and manage your videos.</p>
      <form class="auth-form" method="post" action="?/OAuth2">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          type="submit"
        >
          Login with Google
        </button>
      </form>
    </div>
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
        on:input={handleSearch}
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
                class="px-4 py-2 cursor-pointer w-[450px]"
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
                <td class="border px-4 py-2 w-[450px]"
                  >{video.snippet?.title || "No title"}
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-2 text-blue-500 hover:text-blue-700"
                    on:click|stopPropagation
                  >
                    View
                  </a>
                </td>
                <td class="border px-4 py-2"
                  >{video.statistics?.viewCount?.toLocaleString() || "N/A"}</td
                >
                <td class="border px-4 py-2"
                  >{video.statistics?.likeCount?.toLocaleString() || "N/A"}</td
                >
                <td class="border px-4 py-2"
                  >{video.snippet?.publishedAt
                    ? new Date(video.snippet.publishedAt).toLocaleDateString()
                    : "N/A"}</td
                >
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
        <div class="mt-4 flex justify-center">
          {#each Array(totalPages) as _, i}
            <button
              class="mx-1 px-3 py-1 border rounded {currentPage === i + 1
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500'}"
              on:click={() => (currentPage = i + 1)}
            >
              {i + 1}
            </button>
          {/each}
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
