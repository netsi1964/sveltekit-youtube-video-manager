import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

const CHANGES_FILE = path.join(process.cwd(), "changes.json");

function readChanges() {
  if (fs.existsSync(CHANGES_FILE)) {
    const data = fs.readFileSync(CHANGES_FILE, "utf8");
    return JSON.parse(data);
  }
  return {};
}

function writeChanges(changes) {
  fs.writeFileSync(CHANGES_FILE, JSON.stringify(changes, null, 2));
}

const dataDir = path.join(process.cwd(), "data");
const localChangesPath = path.join(dataDir, "local-changes.json");

export async function GET() {
  try {
    const fileContent = await fs.readFile(localChangesPath, "utf-8");
    const localChanges = JSON.parse(fileContent);

    const videosWithChanges = Object.entries(localChanges).map(
      ([id, changes]) => ({
        id,
        ...changes,
      })
    );

    return json({
      videos: videosWithChanges,
      count: videosWithChanges.length,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return json({ videos: [], count: 0 });
    }
    console.error("Error reading local changes file:", error);
    return json({ error: "Failed to read local changes" }, { status: 500 });
  }
}

export async function PUT({ params, request }) {
  const videoId = params.id;
  const updatedVideo = await request.json();

  const changes = readChanges();
  changes[videoId] = updatedVideo;
  writeChanges(changes);

  return json({ success: true });
}
