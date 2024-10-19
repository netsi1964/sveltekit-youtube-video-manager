import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";
import { fetchYouTubeVideos } from "$lib/youtube"; // Assume this is your actual API fetch function

const VIDEO_DATA_PATH = path.join(process.cwd(), "data", "videos.json");

export async function POST() {
  try {
    // Fetch real YouTube videos
    const videos = await fetchYouTubeVideos();

    // Save the fetched videos to the local JSON file
    await fs.writeFile(VIDEO_DATA_PATH, JSON.stringify({ videos }, null, 2));

    return json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return json({ error: "Failed to fetch YouTube videos" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Read the JSON file
    const fileContents = await fs.readFile(VIDEO_DATA_PATH, "utf-8");
    const { videos } = JSON.parse(fileContents);
    return json({ videos });
  } catch (error) {
    console.error("Error reading YouTube videos from file:", error);
    return json(
      { error: "Failed to retrieve YouTube videos" },
      { status: 500 }
    );
  }
}
