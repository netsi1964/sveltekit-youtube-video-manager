import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

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

export async function PUT({ params, request }) {
  const { id } = params;
  const data = await request.json();

  // Define the path for the local changes file
  const dataDir = path.join(process.cwd(), "data");
  const localChangesPath = path.join(dataDir, "local-changes.json");

  try {
    // Ensure the data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read the existing local changes
    let localChanges = {};
    try {
      const fileContent = await fs.readFile(localChangesPath, "utf-8");
      localChanges = JSON.parse(fileContent);
    } catch (error) {
      // If the file doesn't exist or is empty, start with an empty object
      if (error.code !== "ENOENT") {
        console.error("Error reading local changes file:", error);
        throw error;
      }
    }

    // Update the changes for the given id
    localChanges[id] = data;

    // Write the updated changes back to the file
    await fs.writeFile(localChangesPath, JSON.stringify(localChanges, null, 2));

    const result = { success: true, message: `Changes for id ${id} updated` };
    return json(result);
  } catch (error) {
    console.error("Error updating local changes:", error);
    return json(
      {
        success: false,
        message: "Failed to update local changes",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
