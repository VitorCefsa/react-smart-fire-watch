import React from 'react' // Importa o React para criar componentes
import { Routes, Route } from 'react-router-dom' // Importa componentes de rota para navegação SPA

// Importa as views (telas) que serão exibidas com base na rota
import DashboardView from '../../views/Dashboard/DashboardView'
import IncidentsView from '../../views/Incidents/IncidentsView'
import FireDetection from '../../components/FireDetection/FireDetection'
import VideoInferenceView from '../../views/VideoInference/VideoInferenceView'
import MultiCameraDetectionView from '../../views/MultiCameraDetection/MultiCameraDetectionView'

import './MainContent.css' // Importa o CSS específico para o layout principal

// Componente que representa o conteúdo principal da aplicação
const MainContent = ({ sidebarOpen }) => {
  return (
    <div 
      className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} // Aplica classes com base na visibilidade da sidebar
      style={{
        marginLeft: sidebarOpen ? '250px' : '80px', // Define o deslocamento lateral do conteúdo dependendo da sidebar
        transition: 'margin-left 0.3s ease' // Animação suave ao abrir/fechar a sidebar
      }}
    >
      <Routes> {/* Define as rotas de navegação da aplicação */}
        <Route path="/" element={<IncidentsView />} />  {/* Rota raiz mostra a view de incidentes*/}
        <Route path="/cameras" element={<FireDetection />} />  {/* Rota para câmera ao vivo*/}
        <Route path="/incidents" element={<IncidentsView />} />  {/* Rota para lista de incidentes (redundante com /)*/}
      </Routes>
    </div>
  )
}

export default MainContent // Exporta o componente para uso em outras partes do app
