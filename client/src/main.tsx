import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "@radix-ui/react-toast";

createRoot(document.getElementById("root")!).render(<Provider><App /></Provider>);
