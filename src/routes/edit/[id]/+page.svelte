<script>
  import Modal from "$lib/Modal.svelte";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import { onMount } from "svelte";
  import Tags from "$lib/Tags.svelte";

  export let data;

  let originalVideo;
  let video = {
    ...data.video,
    tags: data.video.tags || [],
    metaTags: data.video.metaTags || [],
  };
  let loading = false;
  let error = null;
  let showModal = false;
  let modalMessage = "";
  let activeTab = "youtube";
  let editingTags = false;
  let localChanges = {};
  let unsavedChangesCount = 0;
  let generatingMetadata = false;
  let hasUnsavedChanges = false;

  // Meta data
  let metaData = {
    transcriptUrl: video.transcriptUrl || "",
    title: video.title || "",
    description: video.description || "",
    tags: Array.isArray(video.tags)
      ? [...video.tags]
      : (video.tags || "").split(",").map((tag) => tag.trim()),
  };

  let aiGeneratedData = {
    titles: ["", "", ""],
    descriptions: ["", "", ""],
    tags: [],
  };

  let selectedTitle = -1;
  let selectedDescription = -1;

  $: hasUnsavedChanges =
    JSON.stringify(originalVideo) !== JSON.stringify(video);
  $: isValidUrl =
    metaData.transcriptUrl && /^https?:\/\/.+/.test(metaData.transcriptUrl);
  $: tagsMatch =
    JSON.stringify([...metaData.tags].sort()) ===
    JSON.stringify([...aiGeneratedData.tags].sort());

  onMount(async () => {
    try {
      originalVideo = JSON.parse(JSON.stringify(video));
      const response = await fetch("/api/local-changes");
      if (response.ok) {
        localChanges = await response.json();
        updateUnsavedChangesCount();
      }
    } catch (err) {
      showError("Error loading local changes: " + err.message);
    }
  });

  function closeModal() {
    showModal = false;
    error = null;
  }

  function updateUnsavedChangesCount() {
    unsavedChangesCount = Object.keys(localChanges).length;
  }

  function showError(message) {
    error = message;
    modalMessage = message;
    showModal = true;
  }

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`/api/local-changes/${video.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(video),
      });

      if (!response.ok) throw new Error("Failed to save changes locally");

      const result = await response.json();
      if (!result.success) throw new Error("Failed to save changes locally");

      localChanges[video.id] = video;
      updateUnsavedChangesCount();
      modalMessage = "Changes saved locally!";
      showModal = true;
    } catch (err) {
      showError(err.message);
    } finally {
      loading = false;
    }
  }

  function handleTagsClick() {
    editingTags = true;
  }

  function handleTagsBlur() {
    metaData.tags = metaData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    video.tags = [...metaData.tags];
    editingTags = false;
  }

  async function generateMetaData() {
    generatingMetadata = true;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulating AI generation
    aiGeneratedData = {
      titles: [
        "New Features That Will Blow Your Mind",
        "You Won't Believe What We've Added",
        "The Update You've Been Waiting For",
      ],
      descriptions: [
        "Discover the groundbreaking features that will transform your experience...",
        "We've listened to your feedback and made significant improvements...",
        "Get ready for a game-changing update that will boost your productivity...",
      ],
      tags: ["new features", "product update", "innovation", "technology"],
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
      const response = await fetch("/api/sync-to-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localChanges),
      });

      if (!response.ok) throw new Error("Failed to sync changes to YouTube");

      localChanges = {};
      updateUnsavedChangesCount();
      modalMessage = "Changes synced to YouTube successfully!";
      showModal = true;
    } catch (err) {
      showError(err.message);
    } finally {
      loading = false;
    }
  }

  function handleTagChange(event) {
    video.tags = event.detail.tags;
  }

  function handleMetaTagChange(event) {
    video.metaTags = event.detail.tags;
  }

  function handleMetaTagsChange(event) {
    metaData.tags = event.detail.tags;
    // If you need to trigger any updates or validations
    metaData = { ...metaData };
  }
</script>

<svelte:head>
  <title>Edit Video: {video?.title}{hasUnsavedChanges ? " *" : ""}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 custom-scrollbar">
  <div class="flex justify-between items-center mb-4">
    <a href="/" class="inline-block text-blue-500 hover:text-blue-700"
      >← Back to list</a
    >
    <button
      on:click={syncToYouTube}
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      disabled={unsavedChangesCount === 0}
    >
      Sync {unsavedChangesCount}
      {unsavedChangesCount === 1 ? "video" : "videos"} to YouTube
    </button>
  </div>

  <h1 class="text-3xl font-bold mb-4">
    Edit Video: {video.title}{hasUnsavedChanges ? " *" : ""}
  </h1>

  <div class="mb-4">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex">
        <button
          class="py-2 px-4 border-b-2 font-medium text-sm leading-5 focus:outline-none {activeTab ===
          'youtube'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => (activeTab = "youtube")}
        >
          YouTube Video
        </button>
        <button
          class="ml-8 py-2 px-4 border-b-2 font-medium text-sm leading-5 focus:outline-none {activeTab ===
          'metadata'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => (activeTab = "metadata")}
        >
          Meta Data
        </button>
      </nav>
    </div>
  </div>

  <div class="mt-4">
    {#if activeTab === "youtube"}
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700"
            >Title:</label
          >
          <input
            id="title"
            bind:value={video.title}
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700">Description:</label
          >
          <textarea
            id="description"
            bind:value={video.description}
            required
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700"
            >Tags:</label
          >
          <Tags bind:tags={video.tags} on:change={handleTagChange} />
        </div>
        <button
          type="submit"
          disabled={loading}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    {:else if activeTab === "metadata"}
      <div class="space-y-4 w-full">
        <div>
          <label
            for="transcriptUrl"
            class="block text-sm font-medium text-gray-700"
            >Transcript URL:</label
          >
          <input
            id="transcriptUrl"
            bind:value={metaData.transcriptUrl}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label for="metaTitle" class="block text-sm font-medium text-gray-700"
            >Title:</label
          >
          <input
            id="metaTitle"
            bind:value={metaData.title}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label
            for="metaDescription"
            class="block text-sm font-medium text-gray-700">Description:</label
          >
          <textarea
            id="metaDescription"
            bind:value={metaData.description}
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label for="metaTags" class="block text-sm font-medium text-gray-700"
            >Tags:</label
          >
          <Tags
            bind:tags={metaData.tags}
            on:change={handleMetaTagsChange}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div class="flex space-x-2">
          <button
            on:click={saveMetaData}
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Save new meta data
          </button>
          <button
            on:click={generateMetaData}
            disabled={!isValidUrl || generatingMetadata}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            title={!isValidUrl ? "Please enter transcript URL" : ""}
          >
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
              <div
                class="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
              >
                <p class="flex-grow">{title}</p>
                <button
                  on:click={() => useTitle(index)}
                  class="px-2 py-1 bg-blue-500 text-white rounded text-sm {selectedTitle ===
                  index
                    ? 'bg-green-500'
                    : ''}"
                >
                  Use this
                </button>
              </div>
            {/each}
          </div>
        {/if}
        {#if aiGeneratedData.descriptions.length > 0}
          <div>
            <h3 class="text-lg font-semibold mb-2">
              AI Generated Descriptions:
            </h3>
            {#each aiGeneratedData.descriptions as description, index}
              <div
                class="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
              >
                <p class="flex-grow">{description}</p>
                <button
                  on:click={() => useDescription(index)}
                  class="px-2 py-1 bg-blue-500 text-white rounded text-sm {selectedDescription ===
                  index
                    ? 'bg-green-500'
                    : ''}"
                >
                  Use this
                </button>
              </div>
            {/each}
          </div>
        {/if}
        {#if aiGeneratedData.tags.length > 0}
          <div>
            <h3 class="text-lg font-semibold mb-2">AI Generated Tags:</h3>
            <div
              class="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
            >
              <div class="flex flex-wrap gap-2">
                {#each aiGeneratedData.tags as tag}
                  <span class="bg-gray-200 px-2 py-1 rounded">{tag}</span>
                {/each}
              </div>
              <button
                on:click={useTags}
                class="px-2 py-1 {tagsMatch
                  ? 'bg-green-500'
                  : 'bg-blue-500'} text-white rounded text-sm"
              >
                Use tags
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<Modal show={showModal} message={modalMessage} onClose={closeModal} />

{#if loading}
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
  >
    <LoadingSpinner size="w-16 h-16" />
  </div>
{/if}
