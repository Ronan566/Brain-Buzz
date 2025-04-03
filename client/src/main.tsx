import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add some global styles to match the design
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  body {
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    height: 100vh;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
  
  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;
document.head.appendChild(styleElement);

createRoot(document.getElementById("root")!).render(<App />);
