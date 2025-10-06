import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const preloader = document.getElementById("preloader");

if (preloader) {
  // Fade out preloader smoothly
  preloader.classList.add("transition-opacity", "duration-500");
  preloader.style.opacity = "0";

  // Remove after fade duration
  setTimeout(() => {
    preloader.remove();
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }, 500);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
