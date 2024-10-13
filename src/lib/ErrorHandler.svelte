<script>
  import { errorStore, clearError } from "./stores/errorStore.js";
  import { fade } from "svelte/transition";

  function handleClose() {
    clearError();
  }
</script>

{#if $errorStore}
  <div
    transition:fade
    class="fixed top-0 left-0 right-0 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 flex justify-between items-start z-50"
  >
    <div>
      <h3 class="font-bold">Error</h3>
      <p class="text-sm">{$errorStore.message}</p>
      {#if $errorStore.details}
        <details class="mt-2">
          <summary class="cursor-pointer text-sm font-semibold"
            >More details</summary
          >
          <pre class="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(
              $errorStore.details,
              null,
              2
            )}</pre>
        </details>
      {/if}
    </div>
    <button
      on:click={handleClose}
      class="bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-2 rounded ml-4"
    >
      Close
    </button>
  </div>
{/if}
