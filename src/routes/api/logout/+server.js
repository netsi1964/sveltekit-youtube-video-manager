import { json } from "@sveltejs/kit";

export async function POST({ cookies }) {
  cookies.set("userData", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return json({ success: true });
}
