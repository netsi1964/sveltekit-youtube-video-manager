import { error } from "@sveltejs/kit";
import { videos } from "$lib/videoData.js";

export function load({ params }) {
  const video = videos.find((v) => v.id === params.id);

  if (!video) {
    throw error(404, "Video not found");
  }

  return { video };
}
