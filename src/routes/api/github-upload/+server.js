import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  const { token, repo } = await request.json();
  
  const files = getAllFiles('/home/project');
  const apiUrl = `https://api.github.com/repos/${repo}/contents/`;

  for (const file of files) {
    const relativePath = path.relative('/home/project', file);
    const content = fs.readFileSync(file, 'base64');

    try {
      const response = await fetch(apiUrl + relativePath, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add ${relativePath}`,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to upload ${relativePath}:`, errorData);
        return json({ success: false, error: `Failed to upload ${relativePath}` });
      }
    } catch (error) {
      console.error(`Error uploading ${relativePath}:`, error);
      return json({ success: false, error: `Error uploading ${relativePath}` });
    }
  }

  return json({ success: true });
}

function getAllFiles(dirPath) {
  const files = fs.readdirSync(dirPath);

  let arrayOfFiles = [];
  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = [...arrayOfFiles, ...getAllFiles(dirPath + "/" + file)];
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}