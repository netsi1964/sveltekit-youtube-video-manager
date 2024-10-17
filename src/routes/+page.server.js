import { redirect, error } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

export async function load({ fetch }) {
  try {
    const response = await fetch("/api/videos");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const videos = await response.json();
    return { videos: videos }; // Ensure we're returning { videos: [...] }
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
      scope: "https://www.googleapis.com/auth/userinfo.profile  openid ",
      prompt: "consent",
    });

    throw redirect(302, authorizeUrl);
  },
};
