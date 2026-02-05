import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <App />
      {/* 🔔 Toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </UserProvider>
  </React.StrictMode>
);

