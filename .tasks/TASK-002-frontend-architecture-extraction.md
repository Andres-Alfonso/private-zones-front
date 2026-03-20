# TASK-002: Extracción del Mapa de Arquitectura Frontend (Remix)

## Metadata
- **ID:** TASK-002
- **Tipo:** Documentación / Reverse Engineering
- **Prioridad:** Critical Path — Bloqueante para todas las tareas de frontend subsiguientes
- **Output esperado:** `APP_ARCHITECTURE.md`
- **Stack detectado:** Remix v2 + React 18 + Tailwind v4 + TypeScript + Axios + JWT
- **Auditoría externa:** ⚠️ El artefacto generado será validado por un sistema de revisión automatizada (OpenAI Codex). La precisión, completitud y adherencia al formato son requisitos no negociables. Cualquier inconsistencia entre el código fuente y el documento generado será detectada y reportada como fallo.

---

## Contexto del Negocio

Este proyecto es el **frontend del sistema core de la compañía**, parte de una migración desde una arquitectura legacy. El frontend está construido con Remix v2 (file-based routing, SSR, loaders/actions) y consume una API backend mediante Axios con autenticación JWT.

Estamos estableciendo las **bases de infraestructura de IA para desarrollo con agentes**. Esta tarea es el paso fundacional para el frontend: sin un mapa preciso de la arquitectura de la aplicación, ningún agente puede implementar features, refactorizar, o migrar componentes correctamente.

El archivo `APP_ARCHITECTURE.md` resultante será la **fuente de verdad compartida** entre todos los agentes que trabajen en el frontend. Si este documento es incorrecto, toda decisión de desarrollo posterior estará comprometida.

**No se asume conocimiento previo del dominio de negocio.** El agente debe descubrir el dominio exclusivamente a partir del código fuente (nombres de rutas, componentes, tipos, loaders). El contexto de negocio debe documentarse tal como emerge del código, sin invenciones ni suposiciones externas.

---

## Objetivo

Analizar **exhaustivamente** toda la aplicación Remix y producir un único archivo `APP_ARCHITECTURE.md` que documente:

1. Las convenciones generales del proyecto.
2. El árbol completo de rutas con sus data flows (loaders/actions).
3. El inventario de componentes compartidos con sus interfaces.
4. Los tipos y contratos de datos.
5. La capa de integración con APIs externas.

---

## Fuente de Verdad

La fuente de verdad son **exclusivamente los archivos del código fuente**. No inferir comportamiento desde comentarios, READMEs desactualizados, o configuraciones de CI/CD. Si existe discrepancia entre un tipo y su uso real, el tipo (la interfaz/type declaration) prevalece.

Archivos a inspeccionar (en orden de prioridad):

| Prioridad | Patrón | Qué extraer |
|:---------:|--------|-------------|
| 1 | `app/routes/**/*.tsx` | Rutas, loaders, actions, meta, links, ErrorBoundary |
| 2 | `app/components/**/*.tsx` | Componentes compartidos, props interfaces |
| 3 | `app/types/**/*.ts`, `app/models/**/*.ts` | Tipos, interfaces, enums del dominio |
| 4 | `app/services/**/*.ts`, `app/utils/**/*.ts`, `app/lib/**/*.ts` | Capa de API, helpers, configuración Axios/JWT |
| 5 | `app/hooks/**/*.ts` | Custom hooks y su lógica |
| 6 | `app/root.tsx` | Layout raíz, providers globales, meta global |
| 7 | `app/entry.server.tsx`, `app/entry.client.tsx` | Setup de SSR/hydration |
| 8 | `vite.config.ts`, `tsconfig.json`, `tailwind.config.*` | Configuración del build y aliases |

---

## Formato de Salida Obligatorio

El archivo `APP_ARCHITECTURE.md` **debe** seguir esta estructura exacta.

```markdown
# FRONTEND APP ARCHITECTURE MAP

## 1. Project Conventions
*   **Framework:** [Remix version detectada]
*   **Rendering:** [SSR/CSR/Hybrid — detectar del entry files]
*   **Styling:** [Tailwind version + estrategia (utility classes, componentes, etc.)]
*   **State Management:** [Remix loaders / Context / Zustand / etc. — lo que se detecte]
*   **API Layer:** [Axios / fetch / cliente custom — cómo se comunica con el backend]
*   **Auth Strategy:** [JWT decode + storage strategy detectada]
*   **Naming:** Files (`convención`), Components (`convención`), Routes (`convención`)
*   **Path Aliases:** [aliases de tsconfig si existen, ej: `~/*` → `app/*`]

## 2. Route Tree (The Spine)

Representación del árbol de rutas con data flow por ruta.

### `app/routes/route-file-name.tsx` — URL: `/resolved/path`
*   **Loader:** [Sí/No] — Breve descripción de qué datos carga
*   **Action:** [Sí/No] — Breve descripción de qué mutación ejecuta
*   **Auth:** [Protegida/Pública] — Si tiene guards o redirects de auth
*   **Layout:** [Parent layout si aplica]
*   **Key Components Used:** `ComponentA`, `ComponentB`
*   **API Calls:** `GET /endpoint`, `POST /endpoint` (si identificable desde el loader/action)

## 3. Shared Components Inventory

### `ComponentName` — path: `app/components/path/Component.tsx`
*   **Props:** `propName` (type, required/optional), ...
*   **Internal State:** [Describe hooks useState/useReducer si los tiene]
*   **Dependencies:** [Otros componentes que usa internamente]
*   **Used By:** [Rutas o componentes que lo consumen — si es determinable]

## 4. Type Definitions & Domain Contracts

### `TypeName` — path: `app/types/path/file.ts`
*   **Kind:** [interface / type / enum]
*   **Fields:** `fieldName` (type, optional?), ...
*   **Used By:** [Loaders, components, services que lo referencian — si es determinable]

## 5. API Integration Layer

### API Client Setup
*   **Base URL:** [Cómo se configura — env var, hardcoded, etc.]
*   **Auth Injection:** [Cómo se adjunta el JWT — interceptor, header manual, etc.]
*   **Error Handling:** [Patrón global si existe]

### Endpoints Consumed
*   `METHOD /path` — Usado por: `route-or-service` — Request type → Response type

## 6. Custom Hooks

### `useHookName` — path: `app/hooks/useHookName.ts`
*   **Purpose:** descripción breve
*   **Parameters:** `param` (type)
*   **Returns:** type
*   **Dependencies:** [APIs, contextos, u otros hooks que usa]

## 7. Global Setup

### Root Layout (`app/root.tsx`)
*   **Providers:** [Context providers, theme, etc.]
*   **Global Meta:** [title, charset, viewport, etc.]
*   **Global Links:** [stylesheets, fonts, etc.]
*   **Error Boundary:** [Sí/No — comportamiento]

### Entry Files
*   **Server:** [Notas relevantes de `entry.server.tsx`]
*   **Client:** [Notas relevantes de `entry.client.tsx`]
```

### Reglas del formato:
- El Route Tree debe listar TODAS las rutas, no solo las "principales".
- Cada ruta debe indicar si tiene loader, action, o ambos.
- Los componentes compartidos deben incluir sus props con tipos.
- Los tipos deben listar todos los fields, no resumirlos.
- Los endpoints deben documentarse con método HTTP y path.
- Si algo no es determinable con certeza del código, marcar como `[no determinado]`.

---

## Reglas de Negocio a Capturar

Si al inspeccionar el código detectas alguna de estas piezas, documéntalas donde corresponda:

- Route guards o middleware de autenticación (redirects en loaders).
- Manejo de roles o permisos en las rutas.
- Estrategia de manejo de errores (ErrorBoundary por ruta vs global).
- Patrones de data fetching (waterfall vs parallel en loaders).
- Patrones de formularios (Remix `<Form>` vs fetch manual).
- Lógica de cache o revalidation.
- Environment variables consumidas (sin valores, solo nombres).
- Convenciones de organización de código (feature folders, domain folders, etc.).

---

## Criterios de Aceptación

| # | Criterio | Obligatorio |
|---|----------|:-----------:|
| 1 | El archivo sigue el formato de 7 secciones exacto | ✅ |
| 2 | Todas las rutas del proyecto están documentadas | ✅ |
| 3 | Cada ruta indica loader/action/auth status | ✅ |
| 4 | Todos los componentes compartidos están inventariados con props | ✅ |
| 5 | Todos los tipos/interfaces del dominio están documentados con fields | ✅ |
| 6 | La capa de API está documentada con endpoints y auth strategy | ✅ |
| 7 | Los custom hooks están listados con su propósito y signature | ✅ |
| 8 | No hay rutas, componentes o tipos inventados | ✅ |
| 9 | Los paths relativos son correctos y verificables | ✅ |
| 10 | Todo el contenido proviene exclusivamente del código fuente | ✅ |

---

## Notas sobre Auditoría

> **IMPORTANTE:** Este documento será sometido a validación cruzada automatizada.
> El sistema auditor (OpenAI Codex) recibirá acceso al código fuente y al `APP_ARCHITECTURE.md` generado.
> Se verificará:
> - Que cada ruta listada exista como archivo en `app/routes/`.
> - Que cada componente documentado exista en el path indicado.
> - Que las props documentadas coincidan con las interfaces en el código.
> - Que los loaders/actions marcados existan realmente como exports en las rutas.
> - Que los endpoints documentados coincidan con las llamadas reales en el código.
> - Que no se haya inyectado contexto de dominio externo al proyecto.
>
> **Tolerancia a errores: cero.** Un documento incompleto, con discrepancias, o con información inventada será rechazado.
