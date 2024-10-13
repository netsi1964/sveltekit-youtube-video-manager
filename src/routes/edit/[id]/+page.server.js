import { error } from "@sveltejs/kit";

export async function load({ params, fetch }) {
  try {
    console.log(`[GET /edit/${params.id}] Attempting to load video`);
    const response = await fetch(`/api/videos/${params.id}`);

    console.log(`[GET /edit/${params.id}] Response status:`, response.status);

    if (response.status === 404) {
      console.log(`[GET /edit/${params.id}] Video not found`);
      return { id: params.id, video: null };
    }

    if (!response.ok) {
      console.error(`[GET /edit/${params.id}] Error response`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const video = await response.json();
    console.log(`[GET /edit/${params.id}] Loaded video`);
    return { id: params.id, video };
  } catch (err) {
    console.error(`[GET /edit/${params.id}] Error loading video`);
    throw error(500, {
      message: "Failed to load video",
    });
  }
}
