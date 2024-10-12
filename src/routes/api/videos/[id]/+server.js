import { json } from '@sveltejs/kit';
import { videos } from '$lib/videoData.js';

export function GET({ params }) {
  const video = videos.find(v => v.id === params.id);
  if (video) {
    return json(video);
  }
  return new Response('Not found', { status: 404 });
}

export async function PUT({ params, request }) {
  const updatedVideo = await request.json();
  const index = videos.findIndex(v => v.id === params.id);
  if (index !== -1) {
    videos[index] = { ...videos[index], ...updatedVideo, id: params.id };
    return json(videos[index]);
  }
  return new Response('Not found', { status: 404 });
}