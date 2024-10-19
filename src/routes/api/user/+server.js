// src/routes/api/user/+server.js
import { json } from "@sveltejs/kit";

export async function GET({ locals }) {
  if (locals.user) {
    return json(locals.user);
  } else {
    return new Response(null, { status: 401 });
  }
}
