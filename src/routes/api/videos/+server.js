import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function GET({ locals }) {
  // Check if user exists in locals
  if (!locals.user || !locals.user.name) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  const userName = locals.user.name;

  try {
    const filePath = path.join(process.cwd(), "src", "lib", "user_videos.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const userVideos = JSON.parse(fileContent);
    const videos = userVideos[userName] || [];
    return json({ videos });
  } catch (error) {
    console.error("Error reading videos:", error);
    return json({ error: "Failed to read videos" }, { status: 500 });
  }
}
