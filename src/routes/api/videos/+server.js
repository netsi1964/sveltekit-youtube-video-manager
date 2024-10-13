import { json } from '@sveltejs/kit';
import { videos } from '$lib/videoData.js';

export function GET() {
  console.log('API called, returning videos:', videos.length);
  return json({ videos });
}