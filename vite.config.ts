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

          // Rutas de gestión de tenants (solo para administradores)
          route("tenants", "routes/tenants/_layout.tsx", () => {
            route("", "routes/tenants/_index.tsx", { index: true });
            route("create", "routes/tenants/create.tsx");
            route(":id", "routes/tenants/$id.tsx");
            route(":id/edit", "routes/tenants/$id.edit.tsx");
            // Rutas adicionales para tenants (opcionales)
            // route(":id/settings", "routes/tenants/$id.settings.tsx");
            // route(":id/users", "routes/tenants/$id.users.tsx");
            // route(":id/billing", "routes/tenants/$id.billing.tsx");
          });

          // Rutas de gestión de usuarios
          route("users", "routes/users/_layout.tsx", () => {
            route("", "routes/users/_index.tsx", { index: true });
            // route("create", "routes/users/create.tsx");
            // route(":id", "routes/users/$id.tsx");
            // route(":id/edit", "routes/users/$id.edit.tsx");
            // Rutas adicionales para usuarios (opcionales)
            // route(":id/settings", "routes/users/$id.settings.tsx");
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
    allowedHosts: ['localhost', 'devel.klmsystem.test', 'klmsystem.online'], // permite este host personalizado
  }
});
