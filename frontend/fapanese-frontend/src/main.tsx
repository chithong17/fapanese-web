import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"   // rất quan trọng
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/900.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
