import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { logError } from "./lib/logger";

// Global Error Handler
window.onerror = (message, source, lineno, colno, error) => {
  logError(`Global Error: ${message} at ${source}:${lineno}:${colno}`, "Global");
};

// Global Unhandled Rejection Handler
window.onunhandledrejection = (event) => {
  logError(`Unhandled Rejection: ${event.reason}`, "Global");
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
