<script>
  import { user } from "$lib/stores/userStore";
</script>

{#if $user}
  <p>Hello, {$user.name}! This is some other page.</p>
{:else}
  <p>Please sign in to view this content.</p>
{/if}
