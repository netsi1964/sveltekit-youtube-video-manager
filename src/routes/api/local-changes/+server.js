import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

const localChangesPath = path.join(process.cwd(), "data", "local-changes.json");

export async function GET({ locals }) {
  if (!locals.user || !locals.user.name) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  const userName = locals.user.name;

  try {
    let localChanges = {};
    try {
      const fileContent = await fs.readFile(localChangesPath, "utf-8");
      localChanges = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with an empty object
    }

    const userChanges = localChanges[userName] || [];
    const count = userChanges.length;

    return json({ count, changes: userChanges });
  } catch (error) {
    console.error("Error reading local changes:", error);
    return json({ error: "Failed to read local changes" }, { status: 500 });
  }
}

export async function PUT({ request, locals }) {
  if (!locals.user || !locals.user.name) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  const userName = locals.user.name;
  const updatedVideo = await request.json();

  try {
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

    const index = localChanges[userName].findIndex(
      (v) => v.id === updatedVideo.id
    );
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
