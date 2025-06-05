// server/middleware/admin-auth.ts
import { defineEventHandler, getHeader, createError, getRequestURL } from "h3";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // Only apply authentication to /test/* routes
  if (!url.pathname.startsWith("/test/")) {
    return;
  }

  // Get admin credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";

  // Get the Authorization header
  const authorization = getHeader(event, "authorization");

  if (!authorization || !authorization.startsWith("Basic ")) {
    // No auth provided, send WWW-Authenticate header
    event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication Required",
      data: {
        error: "Please provide valid admin credentials to access this area.",
      },
    });
  }

  // Decode the Basic auth credentials
  const base64Credentials = authorization.substring(6); // Remove 'Basic '
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // Verify credentials
  if (username !== adminUsername || password !== adminPassword) {
    event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid Credentials",
      data: {
        error: "Invalid username or password.",
      },
    });
  }

  // Authentication successful, continue to the requested page
  console.log(
    `[Admin Auth] Successful authentication for user: ${username} accessing ${url.pathname}`
  );
});
