import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock YouTube video data
  const mockYouTubeVideos = [
    {
      id: "yt1",
      title: "Awesome YouTube Video 1",
      description: "This is an awesome video from YouTube",
      views: 10000,
      likes: 500,
      uploadDate: "2023-05-15",
      updated: "2023-05-15T14:30:00Z",
      tags: ["awesome", "youtube"],
    },
    {
      id: "yt2",
      title: "Amazing YouTube Video 2",
      description: "This is an amazing video from YouTube",
      views: 15000,
      likes: 750,
      uploadDate: "2023-05-16",
      updated: "2023-05-16T10:00:00Z",
      tags: ["amazing", "youtube"],
    },
  ];

  try {
    // Save the fetched videos to the local JSON file
    const dataPath = path.join(process.cwd(), "data", "videos.json");
    await fs.writeFile(
      dataPath,
      JSON.stringify({ videos: mockYouTubeVideos }, null, 2)
    );

    return json({ videos: mockYouTubeVideos });
  } catch (error) {
    console.error("Error saving fetched videos:", error);
    return json({ error: "Failed to save fetched videos" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), "data", "videos.json");
    const fileContents = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);

    // Return the videos array from the JSON file
    return json(data.videos);
  } catch (error) {
    console.error("Error reading videos.json:", error);
    return json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
