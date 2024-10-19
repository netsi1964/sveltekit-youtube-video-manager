import { writable } from "svelte/store";

export const localChangesCount = writable(0);
export const localChanges = writable([]);

export async function updateLocalChanges() {
  try {
    const response = await fetch("/api/local-changes");
    if (response.ok) {
      const data = await response.json();
      console.log("updateLocalChanges:", data);
      localChangesCount.set(data.count);
      localChanges.set(data.changes);
    } else {
      console.error("Failed to fetch local changes");
    }
  } catch (error) {
    console.error("Error updating local changes:", error);
  }
}
