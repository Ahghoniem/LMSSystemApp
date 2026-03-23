import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { routes } from "./Router/Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./i18n";
import AuthProvider from "./Context/AuthProvider";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
     <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
    </QueryClientProvider>
  </AuthProvider>
);
