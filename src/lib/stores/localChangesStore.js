import { writable } from "svelte/store";

export const localChangesCount = writable(0);

export async function updateLocalChangesCount() {
  try {
    const response = await fetch("/api/local-changes");
    if (response.ok) {
      const data = await response.json();
      localChangesCount.set(data.count);
    } else {
      console.error("Failed to fetch local changes count");
    }
  } catch (error) {
    console.error("Error updating local changes count:", error);
  }
}
