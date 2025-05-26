import React, { useState } from 'react';
import './QuickCameraAdder.css';

const QuickCameraAdder = ({ onAddCamera }) => {
  const [cameraUrl, setCameraUrl] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [cameraType, setCameraType] = useState('mjpeg');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cameraUrl) return;
    
    const newCamera = {
      id: Date.now(),
      name: cameraName || `Câmera ${Date.now().toString().slice(-4)}`,
      url: cameraUrl,
      type: cameraType
    };
    
    onAddCamera(newCamera);
    setCameraUrl('');
    setCameraName('');
  };

  return (
    <div className="quick-camera-adder">
      <h3>Adicionar Câmera Rápida</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome (opcional):</label>
          <input
            type="text"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
            placeholder="Nome da câmera"
          />
        </div>
        
        <div className="form-group">
          <label>URL da Câmera:</label>
          <input
            type="text"
            value={cameraUrl}
            onChange={(e) => setCameraUrl(e.target.value)}
            placeholder="Ex: http://190.210.250.149:91/mjpg/video.mjpg"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tipo:</label>
          <select
            value={cameraType}
            onChange={(e) => setCameraType(e.target.value)}
          >
            <option value="mjpeg">MJPEG</option>
            <option value="rtsp">RTSP</option>
            <option value="hls">HLS</option>
            <option value="video">Vídeo (MP4)</option>
          </select>
        </div>
        
        <button type="submit" className="add-button">
          Adicionar Câmera
        </button>
      </form>
    </div>
  );
};

export default QuickCameraAdder;