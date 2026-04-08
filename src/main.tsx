import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { RouterProvider } from "react-router/dom";
import { router } from "./routes";
import "./index.css";

const fallback = (
  <div className="bkt-loading-screen">
    <div className="bkt-loading-spinner animate-spin" />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={fallback}>
    <RouterProvider router={router} />
  </Suspense>
);
