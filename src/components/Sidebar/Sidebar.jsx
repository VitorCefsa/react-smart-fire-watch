import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FiGrid, 
  FiCamera, 
  FiAlertTriangle, 
  FiUpload,
  FiMenu,
  FiX
} from 'react-icons/fi'
import './Sidebar.css'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { path: '/cameras', icon: <FiCamera />, label: 'Câmeras' },
    { path: '/incidents', icon: <FiAlertTriangle />, label: 'Incidentes' },
   // { path: '/upload', icon: <FiUpload />, label: 'Upload' }
  ]

  const handleNavigation = (path) => {
    navigate(path)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar principal */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>SmartFireWatch</h2>}
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar