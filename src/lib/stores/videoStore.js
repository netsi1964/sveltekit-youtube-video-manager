import { writable } from "svelte/store";

export const videoStore = writable([]);

export function setVideos(videos) {
  if (Array.isArray(videos)) {
    videoStore.set(videos);
  } else {
    console.warn("Attempted to set non-array value to videoStore");
    videoStore.set([]);
  }
}

export function getVideoById(id) {
  let foundVideo;
  videoStore.subscribe((videos) => {
    foundVideo = videos.find((video) => video.id === id);
  })();
  return foundVideo;
}

export function addVideo(video) {
  videoStore.update((videos) => {
    if (!Array.isArray(videos)) {
      console.warn("videoStore was not an array. Initializing with new video.");
      return [video];
    }
    return [...videos, video];
  });
}

export function updateVideo(updatedVideo) {
  videoStore.update((videos) => {
    if (!Array.isArray(videos)) {
      console.warn(
        "videoStore was not an array. Initializing with updated video."
      );
      return [updatedVideo];
    }
    return videos.map((video) =>
      video.id === updatedVideo.id ? { ...video, ...updatedVideo } : video
    );
  });
}
