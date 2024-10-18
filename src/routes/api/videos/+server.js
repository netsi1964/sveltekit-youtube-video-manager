import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "lib", "videos.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const videos = JSON.parse(fileContent);
    return json({ videos });
  } catch (error) {
    console.error("Error reading videos:", error);
    return json({ error: "Failed to read videos" }, { status: 500 });
  }
}
