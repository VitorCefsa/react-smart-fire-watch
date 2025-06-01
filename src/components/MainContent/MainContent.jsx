import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardView from '../../views/Dashboard/DashboardView'
import IncidentsView from '../../views/Incidents/IncidentsView'
import FireDetection from '../../components/FireDetection/FireDetection'
import VideoInferenceView from '../../views/VideoInference/VideoInferenceView'
import MultiCameraDetectionView from '../../views/MultiCameraDetection/MultiCameraDetectionView';

import './MainContent.css'

const MainContent = ({ sidebarOpen }) => {
  return (
    <div 
      className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        marginLeft: sidebarOpen ? '250px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}
    >
      <Routes>
        <Route path="/" element={<IncidentsView />} />
        <Route path="/cameras" element={<FireDetection />} />
        <Route path="/incidents" element={<IncidentsView />} />
      </Routes>
    </div>
  )
}

export default MainContent