import { json } from "@sveltejs/kit";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";
import fs from "fs/promises";
import path from "path";

export async function GET({ request, fetch, locals }) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = authHeader.split(" ")[1];

  if (!locals.user || !locals.user.name) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  const userName = locals.user.name;

  try {
    const response = await fetch(
      "https://youtube.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=50",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      throw new Error(
        `YouTube API responded with ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    const videos = data.items.map((item) => ({
      id: item.id.videoId,
      snippet: {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
      },
      statistics: {
        viewCount: "0",
        likeCount: "0",
      },
    }));

    // Save videos to a JSON file with user name as the key
    const filePath = path.join(process.cwd(), "src", "lib", "user_videos.json");
    let userVideos = {};
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      userVideos = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with an empty object
    }
    userVideos[userName] = videos;
    await fs.writeFile(filePath, JSON.stringify(userVideos, null, 2));

    return json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
