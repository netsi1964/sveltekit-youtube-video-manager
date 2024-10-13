<script>
  import { createEventDispatcher } from "svelte";

  export let tags = [];
  export let readOnly = false; // New parameter
  let isEditing = false;
  let inputValue = "";

  const dispatch = createEventDispatcher();

  function startEditing() {
    if (!readOnly) {
      isEditing = true;
      inputValue = tags.join(", ");
    }
  }

  function stopEditing() {
    isEditing = false;
    updateTags();
  }

  function updateTags() {
    if (!readOnly) {
      const newTags = inputValue
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
        tags = newTags;
        dispatch("change", { tags });
      }
    }
  }

  function handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      stopEditing();
    }
  }
</script>

{#if isEditing && !readOnly}
  <input
    type="text"
    bind:value={inputValue}
    on:blur={stopEditing}
    on:keydown={handleKeydown}
    class="w-full p-2 border rounded"
    autofocus
  />
{:else}
  <div
    class="flex flex-wrap {readOnly ? '' : 'cursor-pointer'}"
    on:click={startEditing}
  >
    {#if tags.length === 0}
      <span class="text-gray-500 italic">
        {readOnly ? "No tags" : "Click to add tags"}
      </span>
    {:else}
      {#each tags as tag}
        <span
          class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
        >
          {tag}
        </span>
      {/each}
    {/if}
  </div>
{/if}
