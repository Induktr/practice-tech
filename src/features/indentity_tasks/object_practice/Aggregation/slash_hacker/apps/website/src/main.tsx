import "./style.css";
import { BrowserRouter } from "react-router"
import { NuqsAdapter } from "nuqs/adapters/react-router/v8"
import { createRoot } from "react-dom/client"

import Home from "./pages/Home/Home"

const root = createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>
    <NuqsAdapter>
      <Home />
    </NuqsAdapter>
  </BrowserRouter>
);
