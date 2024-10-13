import { writable } from "svelte/store";

export const errorStore = writable(null);

export function setError(message, details = null) {
  errorStore.set({ message, details });
}

export function clearError() {
  errorStore.set(null);
}
