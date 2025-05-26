import React, { useEffect, useRef } from 'react';
import { InferenceEngine, CVImage } from 'inferencejs';

const FireMonitor = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const ctxRef = useRef(null);
  const engineRef = useRef(null);
  const camerasRef = useRef([]);
  const indexRef = useRef(0);
  const ultimoLogPorCamera = useRef({});

  useEffect(() => {
    const iniciar = async () => {
      try {
        const res = await fetch('http://localhost:3333/cameras');
        const data = await res.json();
        camerasRef.current = data.filter(cam => cam.ativa && cam.protocolo === 'WEB');

        engineRef.current = new InferenceEngine();
        await engineRef.current.startWorker("tcc_fire_detection_model_v3", "1", "rf_4gGK3G6jA9OmMcm8Dpq76MOVBjI3");

        processarProximaCamera();
      } catch (err) {
        console.error('Erro ao iniciar monitoramento:', err);
      }
    };

    iniciar();
  }, []);

  const processarProximaCamera = async () => {
    const cameras = camerasRef.current;
    if (cameras.length === 0) return;

    const cam = cameras[indexRef.current];
    indexRef.current = (indexRef.current + 1) % cameras.length;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      await new Promise(res => videoRef.current.onloadedmetadata = res);
      detectar(cam);

    } catch (err) {
      console.error('Erro ao acessar webcam:', err);
      setTimeout(processarProximaCamera, 3000);
    }
  };

  const detectar = (cam) => {
    const ctx = canvasRef.current.getContext("2d");
    ctxRef.current = ctx;

    const workerId = engineRef.current.workers[0];
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    const loop = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const image = new CVImage(videoRef.current);
      const result = await engineRef.current.infer(workerId, image);

      ctx.drawImage(videoRef.current, 0, 0);

      if (result?.objects?.length) {
        result.objects.forEach(async obj => {
          const [x, y, width, height] = obj.bbox;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle = 'red';
          ctx.fillText(`${obj.class} ${(obj.confidence * 100).toFixed(1)}%`, x, y > 10 ? y - 5 : 10);

          const agora = new Date();
          const chave = `${cam.id}_${obj.class}_${agora.toISOString().slice(0, 16)}`;

          if (obj.confidence > 0.7 && !ultimoLogPorCamera.current[chave]) {
            ultimoLogPorCamera.current[chave] = true;

            const logData = {
              data: agora.toISOString().slice(0, 10),
              hora: agora.toTimeString().slice(0, 8),
              camera_id: cam.nome,
              local: cam.local,
              tipo_incidente: obj.class,
              confianca: obj.confidence
            };

            try {
              await fetch('http://localhost:3333/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
              });
              console.log("🔥 Log enviado:", logData);
            } catch (error) {
              console.error("Erro ao enviar log:", error);
            }
          }
        });
      }

      requestAnimationFrame(loop);
    };

    loop();

    setTimeout(() => {
      pararStream();
      processarProximaCamera();
    }, 5000);
  };

  const pararStream = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div style={{ display: 'none' }}>
      <video ref={videoRef} autoPlay muted playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default FireMonitor;
