<script>
  import { page } from "$app/stores";
  import { user, clearUser } from "$lib/stores/userStore";
  import {
    localChangesCount,
    updateLocalChanges,
  } from "./stores/localChangesStore.js";
  import { videoStore } from "./stores/videoStore.js";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(async () => {
    await updateLocalChanges();
  });

  $: routes = [
    { path: "/", label: "Home" },
    {
      path: "/syncToYouTube",
      label:
        $localChangesCount > 0
          ? `Sync ${$localChangesCount} video${$localChangesCount !== 1 ? "s" : ""} to YouTube`
          : "Sync to YouTube",
    },
  ];

  $: videoCount = $videoStore.length;

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        clearUser();
        goto("/", { replaceState: true });
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
</script>

<nav class="bg-blue-600 shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16 w-full">
      <div class="flex items-center w-full">
        <div class="flex-shrink-0">
          <span class="text-white text-xl font-bold">Youtube video manager</span
          >
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            {#each routes as route}
              <a
                href={route.path}
                class="text-white hover:bg-blue-500 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium {$page
                  .url.pathname === route.path
                  ? 'bg-blue-700'
                  : ''}"
              >
                {route.label}
              </a>
            {/each}
          </div>
        </div>
        <div class="flex gap-2 items-center text-white text-sm ml-auto mr-4">
          {#if browser && $user}
            <div
              class="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-700"
            >
              <span class="text-lg">👤</span>
              <span>{$user.name}</span>
            </div>
            <button
              on:click={handleLogout}
              class="px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors duration-200 ease-in-out"
            >
              Logout
            </button>
          {:else}
            <form class="auth-form" method="post" action="?/OAuth2">
              <button
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                type="submit"
              >
                Login with Google
              </button>
            </form>
          {/if}

          Total Videos: {videoCount}
        </div>
      </div>
    </div>
  </div>
</nav>
