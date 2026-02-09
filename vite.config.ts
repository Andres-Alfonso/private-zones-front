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
            route("forgot-password", "routes/auth/forgot-password.tsx");
            route("reset-password", "routes/auth/reset-password.tsx");
          });

          route("home", "routes/home/_layout.tsx", () => {
            route("", "routes/home/_index.tsx", { index: true });
            route("sections/:id", "routes/sections/$id.tsx");
          });

          route("courses", "routes/courses/_layout.tsx", () => {
            route("", "routes/courses/_index.tsx", { index: true });
            route("create", "routes/courses/create.tsx");
            route("my-courses", "routes/courses/my-courses.tsx");
            route("manage", "routes/courses/manage.tsx");
            route(":id", "routes/courses/$id.tsx");
            route(":id/edit", "routes/courses/$id.edit.tsx");

          });

          // Rutas para realizar cursos (nuevo layout)
          route("make/courses", "routes/courses/make/_layout.tsx", () => {
            route(":courseId", "routes/courses/make/$courseId/_index.tsx", { index: true });
            route(":courseId/content/:contentId", "routes/courses/make/$courseId/content/$contentId.tsx");
            // route(":courseId/quiz/:quizId", "routes/courses/make/$courseId/quiz/$quizId.tsx");
            // route(":courseId/task/:taskId", "routes/courses/make/$courseId/task/$taskId.tsx");
            // route(":courseId/forum/:forumId", "routes/courses/make/$courseId/forum/$forumId.tsx");
            // route(":courseId/survey/:surveyId", "routes/courses/make/$courseId/survey/$surveyId.tsx");
            // route(":courseId/activity/:activityId", "routes/courses/make/$courseId/activity/$activityId.tsx");
          });

          route("activities", "routes/activities/_layout.tsx", () => {
            route("course/:courseId", "routes/activities/_index.tsx", { index: true });
            route("create", "routes/activities/create.tsx");
            route("create/:gameType", "routes/activities/create.$gameType.tsx");
            // route(":id", "routes/activities/$id.tsx");
            // route(":id/edit", "routes/activities/$id.edit.tsx");


            // Rutas para el juego de ahorcado
            route(":activityId/games/hanging/create", "routes/activities/games/hanging/create.tsx");
            route(":activityId/games/hanging/edit", "routes/activities/games/hanging/edit.tsx");

            // Rutas para el juego de sopa de letras
            route(":activityId/games/word_search/create", "routes/activities/games/word_search/create.tsx");
            route(":activityId/games/word_search/edit", "routes/activities/games/word_search/edit.tsx");
          });

          // Rutas de gestion de contenidos
          route("contents", "routes/contents/_layout.tsx", () => {
            route("", "routes/contents/_index.tsx", { index: true });
            // Ruta para contenidos de un curso específico
            route("course/:courseId", "routes/contents/$courseId._index.tsx");
            route("create", "routes/contents/create.tsx");
            route(":id", "routes/contents/$id.tsx");
            route("edit/:contentId", "routes/contents/$contentId.tsx");
            // route("create", "routes/contents/create.tsx");
            // route(":id/edit", "routes/contents/$id.edit.tsx");
          });

          // Rutas de gestion de tareas
          route("tasks", "routes/tasks/_layout.tsx", () => {
            route("", "routes/tasks/_index.tsx", { index: true });
            route("courses/:courseId", "routes/tasks/$courseId._index.tsx");
            route("create", "routes/tasks/create.tsx");
            route(":id/edit", "routes/tasks/$id.edit.tsx");
          });

          // Rutas de gestion de módulos
          route("modules", "routes/modules/_layout.tsx", () => {
            route("", "routes/modules/_index.tsx", { index: true });
            // route("course/:courseId", "routes/modules/create.tsx");
            route("course/:courseId/create", "routes/modules/create.tsx");
            route("course/:courseId", "routes/modules/$courseId._index.tsx");
            route(":moduleId", "routes/modules/$moduleId.tsx");
          });

          route("assessments", "routes/assessments/_layout.tsx", () => {
            route("", "routes/assessments/_index.tsx", { index: true });
            route("create", "routes/assessments/create.tsx");
            route(":id/edit", "routes/assessments/$id.edit.tsx");
            route(":id/questions", "routes/assessments/$id.questions.tsx");
            route("course/:courseId", "routes/assessments/$courseId._index.tsx");

            route(":id/start", "routes/assessments/$id.start.tsx");
            route(":id/take", "routes/assessments/$id.take.tsx");
            route(":id/results/:attemptId", "routes/assessments/$id.results.$attemptId.tsx");
          });


          // Rutas de gestion de foros
          route("forums", "routes/forums/_layout.tsx", () => {
            route("", "routes/forums/_index.tsx", { index: true });
            route("create", "routes/forums/create.tsx");
            route(":forumId", "routes/forums/$forumId.tsx");
            route("course/:courseId", "routes/forums/$courseId._index.tsx");
          });

          // Rutas de gestión de tenants (solo para administradores)
          route("tenants", "routes/tenants/_layout.tsx", () => {
            route("", "routes/tenants/_index.tsx", { index: true });
            route("create", "routes/tenants/create.tsx");
            route(":id", "routes/tenants/$id.tsx");
            route(":id/edit", "routes/tenants/$id.edit.tsx");
            route("manage/:id", "routes/tenants/manage.$id.tsx");
            // Rutas adicionales para tenants (opcionales)
            // route(":id/settings", "routes/tenants/$id.settings.tsx");
            // route(":id/users", "routes/tenants/$id.users.tsx");
            // route(":id/billing", "routes/tenants/$id.billing.tsx");
          });

          // Rutas de gestión de usuarios
          route("users", "routes/users/_layout.tsx", () => {
            route("", "routes/users/_index.tsx", { index: true });
            route("create", "routes/users/create.tsx");
            //route(":id", "routes/users/$id.tsx");
            route(":id/edit", "routes/users/$id.edit.tsx");
            //Rutas adicionales para usuarios (opcionales)
            // route(":id/settings", "routes/users/$id.settings.tsx");
          });

          // Rutas para secciones
          route("sections", "routes/sections/_layout.tsx", () => {
            route("", "routes/sections/_index.tsx", { index: true });
            route("create", "routes/sections/create.tsx");
            route(":id/edit", "routes/sections/$id.edit.tsx");
            // route(":id", "routes/sections/$id.tsx");
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
    allowedHosts: true, // permite este host personalizado
    // allowedHosts: ['localhost', 'devel.klmsystem.test', 'klmsystem.online'], // permite este host personalizado
  }
});
