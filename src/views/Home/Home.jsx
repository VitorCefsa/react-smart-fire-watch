import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import FireDetection from '../../components/FireDetection/FireDetection';
import IncidentsView from '../Incidents/IncidentsView';
import DashboardView from '../Dashboard/DashboardView';
import VideoInferenceView from '../VideoInference/VideoInferenceView';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { FiMenu, FiX } from 'react-icons/fi';
import './Home.css';

function Home() {
  const [activeTab, setActiveTab] = useState("cameras");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck);
      if (mobileCheck) setSidebarOpen(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabChange = (tab) => {
    setLoading(true);
    setActiveTab(tab);
    setContentKey(prev => prev + 1);
    
    setTimeout(() => {
      setLoading(false);
      if (isMobile) setSidebarOpen(false);
    }, 300);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    
    switch (activeTab) {
      case 'dashboards':
        return <DashboardView key={`dashboard-${contentKey}`} />;
      case 'cameras':
        return <FireDetection key={`cameras-${contentKey}`} />;
      case 'incidentes':
        return <IncidentsView key={`incidents-${contentKey}`} />;
      case 'upload':
        return <VideoInferenceView key={`upload-${contentKey}`} />;
      default:
        return <FireDetection key={`default-${contentKey}`} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="content-header">
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="page-title">
            {activeTab === 'dashboards' && 'Dashboard'}
            {activeTab === 'cameras' && 'Detecção de Incêndios'}
            {activeTab === 'incidentes' && 'Registro de Incidentes'}
            {activeTab === 'upload' && 'Análise de Vídeo'}
          </h1>
        </header>

        <main className="content-area">
          <div className="content-wrapper" key={`wrapper-${activeTab}`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;