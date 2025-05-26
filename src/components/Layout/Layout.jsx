import React from 'react';
import '../styles/Layout.css';

const Layout = ({ children }) => (
  <div className="layout">
    <header className="layout-header">
      <h1>Fire Watch</h1>
    </header>
    <aside className="layout-sidebar">
      <nav>
        <ul>
          <li><a href="#">Dashboards</a></li>
          <li><a href="#">Câmeras</a></li>
          <li><a href="#">Incidentes</a></li>
          <li><a href="#">Upload de Vídeo</a></li>
        </ul>
      </nav>
    </aside>
    <main className="layout-content">
      {children}
    </main>
    <footer className="layout-footer">
      <span>© 2025 Fire Watch</span>
    </footer>
  </div>
);

export default Layout;
