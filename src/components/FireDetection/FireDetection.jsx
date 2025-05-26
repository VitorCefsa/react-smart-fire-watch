import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import _ from 'lodash';
import async from 'async';
import { InferenceEngine, CVImage } from 'inferencejs';
import { useLogIncident } from '../../hooks/useLogIncident';
import './FireDetection.css';

const FireDetection = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const fpsRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const { enviarLog } = useLogIncident();

  let workerId = null;
  let cameraMode = "environment";
  let prevTime = null;
  let pastFrameTimes = [];
  let inferEngine = null;

  useEffect(() => {
    inferEngine = new InferenceEngine();

    const startVideoStreamPromise = navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: cameraMode } })
      .then((stream) => new Promise((resolve) => {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current.play();
          resolve();
        };
      }));

    const loadModelPromise = inferEngine
      .startWorker("tcc_fire_detection_model_v3", "1", "rf_4gGK3G6jA9OmMcm8Dpq76MOVBjI3")
      .then((id) => { workerId = id; });

    Promise.all([startVideoStreamPromise, loadModelPromise]).then(() => {
      document.body.classList.remove("loading");
      resizeCanvas();
      detectFrame();
    });

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (workerId && inferEngine) {
        inferEngine.terminateWorker(workerId);
      }
    };
  }, []);

  const resizeCanvas = () => {
    if (canvasRef.current) {
      const container = containerRef.current;
      canvasRef.current.width = container.clientWidth;
      canvasRef.current.height = container.clientHeight;

      Object.assign(canvasRef.current.style, {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "0"
      });

      ctxRef.current = canvasRef.current.getContext("2d");
    }
  };

  const renderPredictions = (predictions) => {
    if (!ctxRef.current) return;

    const ctx = ctxRef.current;
    const font = "16px sans-serif";
    const scale = 1;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    predictions.forEach((prediction) => {
      const { bbox, confidence, class: classe } = prediction;
      const x = bbox.x;
      const y = bbox.y;
      const width = bbox.width;
      const height = bbox.height;

      let color = "#FF0000";
      if (confidence >= 0.9) color = "#00FF00";
      else if (confidence >= 0.8) color = "#FFFF00";

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect((x - width / 2) / scale, (y - height / 2) / scale, width / scale, height / scale);

      ctx.fillStyle = color;
      ctx.fillRect((x - width / 2) / scale, (y - height / 2) / scale - 10, (width / scale) * confidence, 5);

      const labelText = `${classe} ${(confidence * 100).toFixed(1)}%`;
      ctx.fillStyle = color;
      const textWidth = ctx.measureText(labelText).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect((x - width / 2) / scale, (y - height / 2) / scale, textWidth + 8, textHeight + 4);
    });

    predictions.forEach((prediction) => {
      const { bbox, class: classe, confidence } = prediction;
      const x = bbox.x;
      const y = bbox.y;
      const width = bbox.width;
      const height = bbox.height;

      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000000";
      ctx.fillText(`${classe} ${(confidence * 100).toFixed(1)}%`,
        (x - width / 2) / 1 + 4,
        (y - height / 2) / 1 + 1);
    });
  };

  const detectFrame = () => {
    if (!workerId || !videoRef.current) {
      requestAnimationFrame(detectFrame);
      return;
    }

    const image = new CVImage(videoRef.current);
    inferEngine
      .infer(workerId, image)
      .then((predictions) => {
        requestAnimationFrame(detectFrame);
        renderPredictions(predictions);

        predictions.forEach(prediction => {
          enviarLog(prediction, 'webcam');
        });

        if (prevTime) {
          pastFrameTimes.push(Date.now() - prevTime);
          if (pastFrameTimes.length > 30) pastFrameTimes.shift();

          const total = pastFrameTimes.reduce((acc, t) => acc + t / 1000, 0);
          const fps = pastFrameTimes.length / total;

          if (fpsRef.current) {
            fpsRef.current.textContent = Math.round(fps);
          }
        }
        prevTime = Date.now();
      })
      .catch((e) => {
        console.log("Erro detectado", e);
        requestAnimationFrame(detectFrame);
      });
  };

  return (
    <div className="fire-detection-container">
      <div id="container" ref={containerRef}>
        <div id="loading">Carregando modelo...</div>
        <video id="video" ref={videoRef} autoPlay muted playsInline></video>
        <canvas id="overlay" ref={canvasRef}></canvas>
        <div id="fps" ref={fpsRef}></div>
      </div>
    </div>
  );
};

export default FireDetection;
