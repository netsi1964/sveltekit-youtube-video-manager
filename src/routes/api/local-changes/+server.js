import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const CHANGES_FILE = path.join(process.cwd(), 'changes.json');

function readChanges() {
  if (fs.existsSync(CHANGES_FILE)) {
    const data = fs.readFileSync(CHANGES_FILE, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

function writeChanges(changes) {
  fs.writeFileSync(CHANGES_FILE, JSON.stringify(changes, null, 2));
}

export function GET() {
  const changes = readChanges();
  return json(changes);
}

export async function PUT({ params, request }) {
  const videoId = params.id;
  const updatedVideo = await request.json();
  
  const changes = readChanges();
  changes[videoId] = updatedVideo;
  writeChanges(changes);
  
  return json({ success: true });
}