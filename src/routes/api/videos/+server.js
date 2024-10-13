import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "videos.json");
    console.log("Attempting to read file:", dataPath);

    const fileExists = await fs
      .access(dataPath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      console.log("Videos data file not found. Returning empty array.");
      return json({ videos: [] });
    }

    const data = await fs.readFile(dataPath, "utf-8");
    const videos = JSON.parse(data);
    return json(videos); // This should already be in the format { videos: [...] }
  } catch (err) {
    console.error("Error reading videos:", err);
    return json(
      { error: "Failed to read videos", details: err.message },
      { status: 500 }
    );
  }
}
