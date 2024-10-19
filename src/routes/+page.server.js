import { redirect, error } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

export async function load({ fetch, locals }) {
  if (!locals.user) {
    return { videos: [], user: null };
  }

  try {
    const response = await fetch("/api/videos");
    if (response.status === 401) {
      // User is not authenticated
      return { videos: [], user: null };
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const videos = await response.json();
    return { videos: videos.videos, user: locals.user };
  } catch (err) {
    console.error("Error loading videos:", err);
    throw error(500, {
      message: "Failed to load videos",
      error: err.message,
    });
  }
}

export const actions = {
  OAuth2: async ({}) => {
    const redirectURL = "http://localhost:5173/oauth";

    const oAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectURL
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube",
        "openid",
      ],
      prompt: "consent",
    });

    throw redirect(302, authorizeUrl);
  },
};
