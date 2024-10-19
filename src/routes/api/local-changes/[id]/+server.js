import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const localChangesPath = path.join(dataDir, "local-changes.json");

export async function POST({ params, request }) {
  const { id } = params;
  const data = await request.json();
  // Process the posted data and save local changes
  // This is a placeholder implementation
  const result = { success: true, message: `Changes for id ${id} saved` };

  return json(result);
}

export async function GET({ params }) {
  const { id } = params;
  // Fetch local changes for the given id
  // This is a placeholder implementation
  const localChanges = { id, changes: "Sample local changes" };

  return json(localChanges);
}

export async function PUT({ params, request, locals }) {
  const { id } = params;

  if (!locals.user || !locals.user.name) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  const userName = locals.user.name;

  try {
    const updatedVideo = await request.json();

    const localChangesPath = path.join(
      process.cwd(),
      "src",
      "lib",
      "local-changes.json"
    );
    let localChanges = {};

    try {
      const fileContent = await fs.readFile(localChangesPath, "utf-8");
      localChanges = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with an empty object
    }

    if (!localChanges[userName]) {
      localChanges[userName] = [];
    }

    const index = localChanges[userName].findIndex((video) => video.id === id);
    if (index !== -1) {
      localChanges[userName][index] = updatedVideo;
    } else {
      localChanges[userName].push(updatedVideo);
    }

    await fs.writeFile(localChangesPath, JSON.stringify(localChanges, null, 2));

    return json({ success: true });
  } catch (error) {
    console.error("Error saving local changes:", error);
    return json({ error: "Failed to save local changes" }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  const { id } = params;

  try {
    // Read the current local changes
    const fileContent = await fs.readFile(localChangesPath, "utf-8");
    let localChanges = JSON.parse(fileContent);

    // Remove the specified video
    delete localChanges[id];

    // Write the updated changes back to the file
    await fs.writeFile(localChangesPath, JSON.stringify(localChanges, null, 2));

    return json({
      success: true,
      message: `Video ${id} removed from local changes`,
    });
  } catch (error) {
    console.error("Error removing video from local changes:", error);
    return json(
      { success: false, message: "Failed to remove video from local changes" },
      { status: 500 }
    );
  }
}
