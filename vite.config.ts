import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from '@tailwindcss/vite'

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("auth", "routes/auth/_layout.tsx", () => {
            route("register", "routes/auth/register.tsx");
            route("login", "routes/auth/login.tsx");
          });
          route("courses", "routes/courses/_layout.tsx", () => {
            route("", "routes/courses/_index.tsx", { index: true });
            route("create", "routes/courses/create.tsx");
            route("my-courses", "routes/courses/my-courses.tsx");
            route("manage", "routes/courses/manage.tsx");
            route(":id", "routes/courses/$id.tsx");
            route(":id/edit", "routes/courses/$id.edit.tsx");
            // Ruta para el reproductor de curso (opcional)
            // route(":id/learn", "routes/courses/$id.learn.tsx");
          });
        });
      },
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    host: true, // permite conexiones externas (equivale a --host)
    allowedHosts: ['devel.klmsystem.test', 'klmsystem.online' ], // permite este host personalizado
  }
});
