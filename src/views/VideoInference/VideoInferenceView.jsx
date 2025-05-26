// src/views/VideoInference/VideoInferenceView.jsx

import React, { useRef, useState } from 'react';
import './VideoInference.css';
import { startYOLOInference } from './VideoInferenceViewModel';

function VideoInferenceView() {
  const [videoFile, setVideoFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video')) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  const startInference = () => {
    setProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    startYOLOInference(video, canvas, setProcessing);
  };

  return (
    <div className="video-inference-container">
      <h2>Upload de Vídeo</h2>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      {videoFile && (
        <>
          <video ref={videoRef} src={videoFile} controls />
          <canvas ref={canvasRef}></canvas>
          <button onClick={startInference} disabled={processing}>
            {processing ? 'Processando...' : 'Iniciar Detecção'}
          </button>
        </>
      )}
    </div>
  );
}

export default VideoInferenceView;
