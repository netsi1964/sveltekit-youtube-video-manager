import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function GET({ params }) {
  try {
    const { id } = params;
    console.log(`[GET /api/videos/${id}] Attempting to fetch video`);

    const dataPath = path.join(process.cwd(), "data", "videos.json");
    console.log(`[GET /api/videos/${id}] Reading file from: ${dataPath}`);

    const fileExists = await fs
      .access(dataPath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      console.error(`[GET /api/videos/${id}] Videos data file not found`);
      return json({ error: "Videos data file not found" }, { status: 404 });
    }

    const data = await fs.readFile(dataPath, "utf-8");
    const parsedData = JSON.parse(data);

    if (!parsedData.videos || !Array.isArray(parsedData.videos)) {
      console.error(`[GET /api/videos/${id}] Invalid video data structure`);
      return json({ error: "Invalid video data structure" }, { status: 500 });
    }

    const video = parsedData.videos.find((v) => v.id === id);

    if (!video) {
      console.log(`[GET /api/videos/${id}] Video not found`);
      return json({ error: `Video with id ${id} not found` }, { status: 404 });
    }

    console.log(`[GET /api/videos/${id}] Returning video`);
    return json(video);
  } catch (err) {
    console.error(`[GET /api/videos/${id}] Error reading video`);
    return json({ error: "Failed to read video" }, { status: 500 });
  }
}

export async function PUT({ params, request }) {
  const { id } = params;
  const updatedVideo = await request.json();

  try {
    const dataPath = path.join(process.cwd(), "data", "videos.json");
    const data = await fs.readFile(dataPath, "utf-8");
    let { videos } = JSON.parse(data);

    if (!Array.isArray(videos)) {
      videos = [];
    }

    const index = videos.findIndex((v) => v.id === id);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...updatedVideo, id };
    } else {
      videos.push({ ...updatedVideo, id });
    }

    await fs.writeFile(dataPath, JSON.stringify({ videos }, null, 2));

    return json(videos[index] || updatedVideo);
  } catch (err) {
    console.error(`[PUT /api/videos/${id}] Error updating video`);
    return json({ error: "Failed to update video" }, { status: 500 });
  }
}
