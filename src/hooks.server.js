import { sequence } from "@sveltejs/kit/hooks";

async function handleSession({ event, resolve }) {
  const session = event.cookies.get("userData");

  if (session) {
    try {
      const userData = JSON.parse(session);
      event.locals.user = userData;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event);
  return response;
}

export const handle = sequence(handleSession);
