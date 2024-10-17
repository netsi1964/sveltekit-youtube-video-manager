import { writable } from "svelte/store";

console.log("Initializing user store");
export const user = writable(null);

export function setUser(userData) {
  console.log(`User set to ${JSON.stringify(userData)}`);
  user.set(userData);
}

export function clearUser() {
  console.log("Clearing user");
  user.set(null);
}
