import React from "react";
import "./Header.css";
export default function Header() {
  return (
    <header className="header">
      <span className="logo">🔥 Smart Fire Watch</span>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/incidents">Incidentes</a>
        <a href="/cameras">Câmeras</a>
        <a href="/multi-camera-detection">Multi-Câmera</a>

      </nav>
    </header>
  );
}
