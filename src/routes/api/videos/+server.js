import { json } from '@sveltejs/kit';
import { videos } from '$lib/videoData.js';

export function GET() {
  return json({ videos });
}