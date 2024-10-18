import { json } from "@sveltejs/kit";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";
import fs from "fs/promises";
import path from "path";

export async function GET({ request, fetch }) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = authHeader.split(" ")[1];

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

    // Save videos to a JSON file
    const filePath = path.join(process.cwd(), "src", "lib", "videos.json");
    await fs.writeFile(filePath, JSON.stringify(videos, null, 2));

    return json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
