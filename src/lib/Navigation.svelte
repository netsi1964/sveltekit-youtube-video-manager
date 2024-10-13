<script>
  import { page } from "$app/stores";
  import { localChangesCount } from "./stores/localChangesStore.js";
  import { videoStore } from "./stores/videoStore.js";

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
        <div class="text-white text-sm ml-auto mr-4">
          Total Videos: {videoCount}
        </div>
      </div>
    </div>
  </div>
</nav>
