// app/utils/session.server.ts

import { createCookieSessionStorage } from "@remix-run/node";

// Reemplaza esto con una clave secreta real en producción
const sessionSecret = process.env.SESSION_SECRET || "default-secret-key";

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "admin_session",
    // Configuración de la cookie
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
    httpOnly: true,
  },
});

export { getSession, commitSession, destroySession };