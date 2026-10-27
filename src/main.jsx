import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./login";
 
createRoot(document.getElementById("app")).render(
  <StrictMode>
    <Login onLogin={(data) => console.log("login", data)} />
  </StrictMode>
);
 