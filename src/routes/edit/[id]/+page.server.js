import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function load({ params }) {
  const { id } = params;

  try {
    const filePath = path.join(process.cwd(), "src", "lib", "videos.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const videos = JSON.parse(fileContent);

    const video = videos.find((v) => v.id === id);

    if (!video) {
      throw error(404, `Video with ID ${id} not found`);
    }

    return { video };
  } catch (err) {
    console.error("Error loading video:", err);
    throw error(500, "Failed to load video");
  }
}

export const actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const updatedVideo = JSON.parse(formData.get("video"));

    try {
      const filePath = path.join(process.cwd(), "src", "lib", "videos.json");
      const fileContent = await fs.readFile(filePath, "utf-8");
      let videos = JSON.parse(fileContent);

      const index = videos.findIndex((v) => v.id === params.id);
      if (index !== -1) {
        videos[index] = updatedVideo;
        await fs.writeFile(filePath, JSON.stringify(videos, null, 2));
        return { success: true };
      } else {
        throw error(404, `Video with ID ${params.id} not found`);
      }
    } catch (err) {
      console.error("Error updating video:", err);
      throw error(500, "Failed to update video");
    }
  },
};
