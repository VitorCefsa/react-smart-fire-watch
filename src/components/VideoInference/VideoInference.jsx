import React, { useRef, useState, useEffect } from 'react';
import './VideoInference.css';

function VideoInference() {
  const [videoFile, setVideoFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/inferencejs';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video')) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  const startInference = async () => {
    setProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const waitForInferenceJs = () =>
      new Promise((resolve) => {
        const check = () => {
          if (window.inferencejs) resolve();
          else setTimeout(check, 100);
        };
        check();
      });

    await waitForInferenceJs();

    const { InferenceEngine, CVImage } = window.inferencejs;
    const inferEngine = new InferenceEngine();

    const workerId = await inferEngine.startWorker(
      'tcc_fire_detection_model_v3',
      '1',
      'rf_4gGK3G6jA9OmMcm8Dpq76MOVBjI3'
    );

    video.onplay = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const draw = async () => {
        if (video.paused || video.ended) {
          setProcessing(false);
          return;
        }

        const image = new CVImage(video);
        const result = await inferEngine.infer(workerId, image);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (result?.objects?.length) {
          result.objects.forEach((obj) => {
            const [x, y, width, height] = obj.bbox;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.font = '16px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText(
              `${obj.class} ${(obj.confidence * 100).toFixed(1)}%`,
              x,
              y > 10 ? y - 5 : 10
            );
          });
        }

        requestAnimationFrame(draw);
      };

      draw();
    };
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
            {processing ? 'Processando...' : 'Iniciar Detecção'
            }
          </button>
        </>
      )}
    </div>
  );
}

export default VideoInference;
