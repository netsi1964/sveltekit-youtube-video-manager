import { error } from "@sveltejs/kit";

export async function load({ fetch }) {
  try {
    const response = await fetch("/api/videos");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const videos = await response.json();
    return { videos: videos }; // Ensure we're returning { videos: [...] }
  } catch (err) {
    console.error("Error loading videos:", err);
    throw error(500, {
      message: "Failed to load videos",
      error: err.message,
    });
  }
}
