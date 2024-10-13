import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock YouTube video data
  const mockYouTubeVideos = [
    {
      kind: "youtube#video",
      etag: "etag1",
      id: "yt1",
      snippet: {
        publishedAt: "2023-05-15T14:30:00Z",
        channelId: "UC1234567890",
        title: "Awesome YouTube Video 1",
        description: "This is an awesome video from YouTube",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/yt1/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/yt1/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/yt1/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Awesome Channel",
        tags: ["awesome", "youtube"],
        categoryId: "22",
        liveBroadcastContent: "none",
        defaultLanguage: "en",
        localized: {
          title: "Awesome YouTube Video 1",
          description: "This is an awesome video from YouTube",
        },
        defaultAudioLanguage: "en",
      },
      contentDetails: {
        duration: "PT15M33S",
        dimension: "2d",
        definition: "hd",
        caption: "false",
        licensedContent: true,
        projection: "rectangular",
      },
      status: {
        uploadStatus: "processed",
        privacyStatus: "public",
        license: "youtube",
        embeddable: true,
        publicStatsViewable: true,
      },
      statistics: {
        viewCount: "10000",
        likeCount: "500",
        dislikeCount: "10",
        favoriteCount: "0",
        commentCount: "100",
      },
    },
    {
      kind: "youtube#video",
      etag: "etag2",
      id: "yt2",
      snippet: {
        publishedAt: "2023-05-16T10:00:00Z",
        channelId: "UC0987654321",
        title: "Amazing YouTube Video 2",
        description: "This is an amazing video from YouTube",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/yt2/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/yt2/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/yt2/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Amazing Channel",
        tags: ["amazing", "youtube"],
        categoryId: "22",
        liveBroadcastContent: "none",
        defaultLanguage: "en",
        localized: {
          title: "Amazing YouTube Video 2",
          description: "This is an amazing video from YouTube",
        },
        defaultAudioLanguage: "en",
      },
      contentDetails: {
        duration: "PT20M45S",
        dimension: "2d",
        definition: "hd",
        caption: "false",
        licensedContent: true,
        projection: "rectangular",
      },
      status: {
        uploadStatus: "processed",
        privacyStatus: "public",
        license: "youtube",
        embeddable: true,
        publicStatsViewable: true,
      },
      statistics: {
        viewCount: "15000",
        likeCount: "750",
        dislikeCount: "25",
        favoriteCount: "0",
        commentCount: "200",
      },
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
