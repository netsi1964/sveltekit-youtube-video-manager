<script>
  import Modal from '$lib/Modal.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import { onMount } from 'svelte';

  export let data;

  let video = data.video;
  let loading = false;
  let error = null;
  let showModal = false;
  let modalMessage = '';
  let activeTab = 'youtube';
  let editingTags = false;
  let localChanges = {};
  let unsavedChangesCount = 0;
  let generatingMetadata = false;

  // Meta data
  let metaData = {
    transcriptUrl: video.transcriptUrl || '',
    title: video.title || '',
    description: video.description || '',
    tags: [...video.tags]
  };

  let aiGeneratedData = {
    titles: ['', '', ''],
    descriptions: ['', '', ''],
    tags: []
  };

  let selectedTitle = -1;
  let selectedDescription = -1;

  $: isValidUrl = metaData.transcriptUrl && /^https?:\/\/.+/.test(metaData.transcriptUrl);

  onMount(async () => {
    try {
      const response = await fetch('/api/local-changes');
      if (response.ok) {
        localChanges = await response.json();
        updateUnsavedChangesCount();
      }
    } catch (err) {
      console.error('Error loading local changes:', err);
    }
  });

  function closeModal() {
    showModal = false;
  }

  function updateUnsavedChangesCount() {
    unsavedChangesCount = Object.keys(localChanges).length;
  }

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`/api/local-changes/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(video),
      });

      if (!response.ok) throw new Error('Failed to save changes locally');

      const result = await response.json();
      if (!result.success) throw new Error('Failed to save changes locally');

      localChanges[video.id] = video;
      updateUnsavedChangesCount();
      modalMessage = 'Changes saved locally!';
      showModal = true;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleTagsClick() {
    editingTags = true;
  }

  function handleTagsBlur() {
    video.tags = metaData.tags;
    editingTags = false;
  }

  async function generateMetaData() {
    generatingMetadata = true;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulating AI generation
    aiGeneratedData = {
      titles: [
        "New Features That Will Blow Your Mind",
        "You Won't Believe What We've Added",
        "The Update You've Been Waiting For"
      ],
      descriptions: [
        "Discover the groundbreaking features that will transform your experience...",
        "We've listened to your feedback and made significant improvements...",
        "Get ready for a game-changing update that will boost your productivity..."
      ],
      tags: ['new features', 'product update', 'innovation', 'technology']
    };
    
    generatingMetadata = false;
  }

  function useTitle(index) {
    metaData.title = aiGeneratedData.titles[index];
    selectedTitle = index;
  }

  function useDescription(index) {
    metaData.description = aiGeneratedData.descriptions[index];
    selectedDescription = index;
  }

  function useTags() {
    metaData.tags = [...aiGeneratedData.tags];
  }

  function saveMetaData() {
    video = { ...video, ...metaData };
    handleSubmit();
  }

  async function syncToYouTube() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/sync-to-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localChanges),
      });

      if (!response.ok) throw new Error('Failed to sync changes to YouTube');

      localChanges = {};
      updateUnsavedChangesCount();
      modalMessage = 'Changes synced to YouTube successfully!';
      showModal = true;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Video: {video.title}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-4">
    <a href="/" class="inline-block text-blue-500 hover:text-blue-700">← Back to list</a>
    <button
      on:click={syncToYouTube}
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      disabled={unsavedChangesCount === 0}
    >
      Sync {unsavedChangesCount} {unsavedChangesCount === 1 ? 'video' : 'videos'} to YouTube
    </button>
  </div>
  
  <h1 class="text-3xl font-bold mb-4">Edit Video: {video.title}</h1>

  <div class="mb-4">
    <button
      class="px-4 py-2 bg-blue-500 text-white rounded mr-2 {activeTab === 'youtube' ? 'bg-blue-700' : ''}"
      on:click={() => activeTab = 'youtube'}
    >
      YouTube Video
    </button>
    <button
      class="px-4 py-2 bg-blue-500 text-white rounded {activeTab === 'metadata' ? 'bg-blue-700' : ''}"
      on:click={() => activeTab = 'metadata'}
    >
      Meta Data
    </button>
  </div>

  {#if activeTab === 'youtube'}
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="title">Title:</label>
        <input id="title" bind:value={video.title} required>
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea id="description" bind:value={video.description} required rows="4"></textarea>
      </div>
      <div>
        <label for="tags">Tags:</label>
        {#if editingTags}
          <input
            id="tags"
            bind:value={video.tags}
            on:blur={handleTagsBlur}
          >
        {:else}
          <div on:click={handleTagsClick} class="mt-1 flex flex-wrap gap-2 cursor-text p-2 border rounded-md bg-white">
            {#each video.tags as tag}
              <span class="bg-gray-200 px-2 py-1 rounded">{tag}</span>
            {/each}
          </div>
        {/if}
      </div>
      <button type="submit" disabled={loading} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  {:else if activeTab === 'metadata'}
    <div class="space-y-4 w-full">
      <div>
        <label for="transcriptUrl">Transcript URL:</label>
        <input id="transcriptUrl" bind:value={metaData.transcriptUrl}>
      </div>
      <div>
        <label for="metaTitle">Title:</label>
        <input id="metaTitle" bind:value={metaData.title}>
      </div>
      <div>
        <label for="metaDescription">Description:</label>
        <textarea id="metaDescription" bind:value={metaData.description} rows="4"></textarea>
      </div>
      <div>
        <label for="metaTags">Tags:</label>
        <input id="metaTags" bind:value={metaData.tags}>
      </div>
      <div class="flex space-x-2">
        <button on:click={saveMetaData} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
          Save new meta data
        </button>
        <button on:click={generateMetaData} disabled={!isValidUrl || generatingMetadata} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50" title={!isValidUrl ? 'Please enter transcript URL' : ''}>
          {#if generatingMetadata}
            <LoadingSpinner size="w-5 h-5" />
          {:else}
            Generate meta data using AI
          {/if}
        </button>
      </div>
      {#if aiGeneratedData.titles.length > 0}
        <div>
          <h3 class="text-lg font-semibold mb-2">AI Generated Titles:</h3>
          {#each aiGeneratedData.titles as title, index}
            <div class="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
              <p class="flex-grow">{title}</p>
              <button on:click={() => useTitle(index)} class="px-2 py-1 bg-blue-500 text-white rounded text-sm {selectedTitle === index ? 'bg-green-500' : ''}">
                Use this
              </button>
            </div>
          {/each}
        </div>
      {/if}
      {#if aiGeneratedData.descriptions.length > 0}
        <div>
          <h3 class="text-lg font-semibold mb-2">AI Generated Descriptions:</h3>
          {#each aiGeneratedData.descriptions as description, index}
            <div class="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
              <p class="flex-grow">{description}</p>
              <button on:click={() => useDescription(index)} class="px-2 py-1 bg-blue-500 text-white rounded text-sm {selectedDescription === index ? 'bg-green-500' : ''}">
                Use this
              </button>
            </div>
          {/each}
        </div>
      {/if}
      {#if aiGeneratedData.tags.length > 0}
        <div>
          <h3 class="text-lg font-semibold mb-2">AI Generated Tags:</h3>
          <div class="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
            <div class="flex flex-wrap gap-2">
              {#each aiGeneratedData.tags as tag}
                <span class="bg-gray-200 px-2 py-1 rounded">{tag}</span>
              {/each}
            </div>
            <button on:click={useTags} class="px-2 py-1 bg-blue-500 text-white rounded text-sm">
              Use tags
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<Modal show={showModal} message={modalMessage} onClose={closeModal} />

{#if loading}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <LoadingSpinner size="w-16 h-16" />
  </div>
{/if}

{#if error}
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong class="font-bold">Error!</strong>
    <span class="block sm:inline">{error}</span>
  </div>
{/if}