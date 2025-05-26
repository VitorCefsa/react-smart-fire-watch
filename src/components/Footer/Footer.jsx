import React from "react";
import "./Footer.css";
export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Smart Fire Watch – Todos os direitos reservados.</span>
    </footer>
  );
}
