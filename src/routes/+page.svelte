<script>
  import { onMount } from 'svelte';
  import { createFuzzySearch } from '$lib/FuzzySearch.js';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';

  export let data;

  let videos = [];
  let filteredVideos = [];
  let searchTerm = '';
  let fuse;
  let loading = true;
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let sortField = 'title';
  let sortDirection = 'asc';
  let error = null;

  $: {
    if (fuse && searchTerm) {
      filteredVideos = fuse.search(searchTerm).map(result => result.item);
    } else {
      filteredVideos = [...videos];
    }
    
    // Sort the filtered videos
    filteredVideos = filteredVideos.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);
  }

  $: paginatedVideos = filteredVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  onMount(async () => {
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      videos = data.videos || [];
      console.log('Loaded videos:', videos.length);
      fuse = createFuzzySearch(videos, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.4,
      });
    } catch (err) {
      console.error('Error fetching videos:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function handleSort(field) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }

  function handleRowClick(id) {
    window.location.href = `/edit/${id}`;
  }
</script>

<svelte:head>
  <title>{data.title}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="fixed top-0 left-0 right-0 bg-white z-10 shadow-md">
    <div class="container mx-auto px-4 py-4">
      <h1 class="text-3xl font-bold mb-4">{data.title}</h1>
      <p class="mb-4">{data.message}</p>

      <div class="mb-4">
        <input
          type="text"
          placeholder="Search videos..."
          bind:value={searchTerm}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>
  </div>

  <div class="mt-32">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    {:else if error}
      <p class="text-red-500">Error: {error}</p>
    {:else if videos.length === 0}
      <p>No videos found.</p>
    {:else}
      <div class="mb-2">Matches {filteredVideos.length} of {videos.length}</div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="px-4 py-2 cursor-pointer" on:click={() => handleSort('title')}>Title {sortField === 'title' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th class="px-4 py-2 cursor-pointer" on:click={() => handleSort('views')}>Views {sortField === 'views' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th class="px-4 py-2 cursor-pointer" on:click={() => handleSort('likes')}>Likes {sortField === 'likes' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th class="px-4 py-2 cursor-pointer" on:click={() => handleSort('uploadDate')}>Upload Date {sortField === 'uploadDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th class="px-4 py-2 cursor-pointer" on:click={() => handleSort('updated')}>Last Updated {sortField === 'updated' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedVideos as video (video.id)}
              <tr class="hover:bg-gray-100 cursor-pointer" on:click={() => handleRowClick(video.id)}>
                <td class="border px-4 py-2">{video.title}</td>
                <td class="border px-4 py-2">{video.views.toLocaleString()}</td>
                <td class="border px-4 py-2">{video.likes.toLocaleString()}</td>
                <td class="border px-4 py-2">{video.uploadDate}</td>
                <td class="border px-4 py-2">{new Date(video.updated).toLocaleString()}</td>
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
  </div>
</div>