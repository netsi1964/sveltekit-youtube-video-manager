import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function load({ params, locals }) {
  const { id } = params;

  if (!locals.user || !locals.user.name) {
    throw error(401, "User not authenticated");
  }

  const userName = locals.user.name;

  try {
    const filePath = path.join(process.cwd(), "src", "lib", "user_videos.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const userVideos = JSON.parse(fileContent);

    const videos = userVideos[userName] || [];
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
  default: async ({ request, params, locals }) => {
    if (!locals.user || !locals.user.name) {
      throw error(401, "User not authenticated");
    }

    const userName = locals.user.name;
    const formData = await request.formData();
    const updatedVideo = JSON.parse(formData.get("video"));

    try {
      const filePath = path.join(
        process.cwd(),
        "src",
        "lib",
        "user_videos.json"
      );
      const fileContent = await fs.readFile(filePath, "utf-8");
      let userVideos = JSON.parse(fileContent);

      if (!userVideos[userName]) {
        throw error(404, "User videos not found");
      }

      const index = userVideos[userName].findIndex((v) => v.id === params.id);
      if (index !== -1) {
        userVideos[userName][index] = updatedVideo;
        await fs.writeFile(filePath, JSON.stringify(userVideos, null, 2));
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
