import { redirect } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

async function getUserData(access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );
  const data = await response.json();
  return { ...data, accessToken: access_token };
}

export const GET = async (event) => {
  const { url, cookies } = event;
  const redirectURL = "http://localhost:5173/oauth";
  const code = await url.searchParams.get("code");
  let userData;

  try {
    const oAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectURL
    );
    const r = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(r.tokens);
    const user = oAuth2Client.credentials;

    userData = await getUserData(user.access_token);
    console.log("User data:", userData);
  } catch (err) {
    console.error("Error logging in with OAuth2 user", err);
  }

  if (userData) {
    cookies.set("userData", JSON.stringify(userData), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  throw redirect(303, "/");
};
