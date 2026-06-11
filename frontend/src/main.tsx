import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/main.scss";

// Gera o favicon dinamicamente: fundo verde #2A3B1C + logo branca
(function gerarFavicon() {
  const img = new Image();
  img.onload = () => {
    const size = 64;
    const pad = 10;
    const radius = 14;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#2A3B1C";
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);

    const link: HTMLLinkElement =
      document.querySelector("link[rel='icon']") ?? document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
    document.head.appendChild(link);
  };
  img.src = "/artlink-icon.png";
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
