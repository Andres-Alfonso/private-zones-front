import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import "./tailwind.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Descomenta el Header si lo necesitas para rutas no relacionadas con autenticación */}
      {/* <Header /> */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Descomenta el Footer si lo necesitas para rutas no relacionadas con autenticación */}
      {/* <Footer /> */}
    </div>
  );
}