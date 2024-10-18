// src/routes/api/user/+server.js
import { json } from "@sveltejs/kit";

export function GET(event) {
  const userDataCookie = event.cookies.get("userData");
  if (userDataCookie) {
    const userData = JSON.parse(userDataCookie);
    return json(userData);
  } else {
    return new Response(null, { status: 401 });
  }
}
