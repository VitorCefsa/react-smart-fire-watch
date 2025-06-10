import React, { useEffect, useRef } from 'react'; // Hooks do React
import $ from 'jquery'; // Biblioteca jQuery (embora não usada explicitamente aqui)
import _ from 'lodash'; // Biblioteca Lodash (também não usada diretamente aqui)
import async from 'async'; // Biblioteca para controle de fluxo assíncrono (também não utilizada no código visível)
import { InferenceEngine, CVImage } from 'inferencejs'; // Ferramentas para inferência de IA e manipulação de imagem
import { useLogIncident } from '../../hooks/useLogIncident'; // Hook personalizado para envio de logs
import './FireDetection.css'; // Estilos específicos do componente

const FireDetection = () => {
  const videoRef = useRef(null); // Referência para o elemento <video>
  const containerRef = useRef(null); // Referência para o container principal
  const fpsRef = useRef(null); // Referência para exibição de FPS
  const canvasRef = useRef(null); // Referência para o <canvas> onde as previsões serão desenhadas
  const ctxRef = useRef(null); // Referência para o contexto 2D do canvas

  const { enviarLog } = useLogIncident(); // Hook que permite enviar logs de incidentes detectados

  let workerId = null; // ID do worker da IA
  let cameraMode = "environment"; // Modo da câmera (traseira em dispositivos móveis)
  let prevTime = null; // Armazena o tempo da última frame
  let pastFrameTimes = []; // Lista de tempos entre frames para cálculo de FPS
  let inferEngine = null; // Instância do mecanismo de inferência

  useEffect(() => {
    inferEngine = new InferenceEngine(); // Inicializa o motor de inferência

    // Solicita acesso à câmera e inicia o vídeo
    const startVideoStreamPromise = navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: cameraMode } })
      .then((stream) => new Promise((resolve) => {
        videoRef.current.srcObject = stream; // Atribui o stream ao elemento <video>
        videoRef.current.onloadeddata = () => {
          videoRef.current.play(); // Inicia o vídeo assim que os dados forem carregados
          resolve();
        };
      }));

    // Carrega o modelo de detecção no worker
    const loadModelPromise = inferEngine
      .startWorker("tcc_fire_detection_model_v3", "1", "rf_4gGK3G6jA9OmMcm8Dpq76MOVBjI3")
      .then((id) => { workerId = id; });

    // Aguarda o carregamento do vídeo e do modelo para iniciar a detecção
    Promise.all([startVideoStreamPromise, loadModelPromise]).then(() => {
      document.body.classList.remove("loading"); // Remove a classe de carregamento
      resizeCanvas(); // Ajusta o tamanho do canvas
      detectFrame(); // Inicia o loop de detecção
    });

    const handleResize = () => resizeCanvas(); // Ajusta o canvas em redimensionamento
    window.addEventListener('resize', handleResize); // Observa o redimensionamento da janela

    // Cleanup na desmontagem do componente
    return () => {
      window.removeEventListener('resize', handleResize);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop()); // Para a câmera
      }
      if (workerId && inferEngine) {
        inferEngine.terminateWorker(workerId); // Encerra o worker
      }
    };
  }, []);

  // Redimensiona o canvas para cobrir o vídeo
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

      ctxRef.current = canvasRef.current.getContext("2d"); // Obtém o contexto 2D
    }
  };

  // Desenha as previsões no canvas
  const renderPredictions = (predictions) => {
    if (!ctxRef.current) return;

    const ctx = ctxRef.current;
    const font = "16px sans-serif";
    const scale = 1;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Limpa o canvas

    predictions.forEach((prediction) => {
      const { bbox, confidence, class: classe } = prediction;
      const x = bbox.x;
      const y = bbox.y;
      const width = bbox.width;
      const height = bbox.height;

      let color = "#FF0000"; // Vermelho para baixa confiança
      if (confidence >= 0.9) color = "#00FF00"; // Verde se confiança ≥ 0.9
      else if (confidence >= 0.8) color = "#FFFF00"; // Amarelo se confiança ≥ 0.8

      // Desenha a caixa delimitadora
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect((x - width / 2) / scale, (y - height / 2) / scale, width / scale, height / scale);

      // Desenha a barra de confiança
      ctx.fillStyle = color;
      ctx.fillRect((x - width / 2) / scale, (y - height / 2) / scale - 10, (width / scale) * confidence, 5);

      // Prepara o rótulo
      const labelText = `${classe} ${(confidence * 100).toFixed(1)}%`;
      ctx.fillStyle = color;
      const textWidth = ctx.measureText(labelText).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect((x - width / 2) / scale, (y - height / 2) / scale, textWidth + 8, textHeight + 4);
    });

    // Desenha o texto do rótulo por cima
    predictions.forEach((prediction) => {
      const { bbox, class: classe, confidence } = prediction;
      const x = bbox.x;
      const y = bbox.y;
      const width = bbox.width;
      const height = bbox.height;

      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000000"; // Cor do texto
      ctx.fillText(`${classe} ${(confidence * 100).toFixed(1)}%`,
        (x - width / 2) / 1 + 4,
        (y - height / 2) / 1 + 1);
    });
  };

  // Função principal de detecção por frame
  const detectFrame = () => {
    if (!workerId || !videoRef.current) {
      requestAnimationFrame(detectFrame); // Aguarda o próximo frame se ainda não estiver pronto
      return;
    }

    const image = new CVImage(videoRef.current); // Captura o frame atual
    inferEngine
      .infer(workerId, image) // Realiza a inferência com o modelo carregado
      .then((predictions) => {
        requestAnimationFrame(detectFrame); // Continua o loop de detecção
        renderPredictions(predictions); // Desenha as predições no canvas

        // Se houver predições, captura uma imagem da câmera e envia o log
        if (predictions.length > 0 && videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imagemBase64 = canvas.toDataURL('image/jpeg');

          // Envia log para cada predição detectada
          predictions.forEach(prediction => {
            enviarLog(prediction, 'webcam', imagemBase64);
          });
        }

        // Cálculo de FPS
        if (prevTime) {
          pastFrameTimes.push(Date.now() - prevTime);
          if (pastFrameTimes.length > 30) pastFrameTimes.shift(); // Mantém os últimos 30 tempos

          const total = pastFrameTimes.reduce((acc, t) => acc + t / 1000, 0);
          const fps = pastFrameTimes.length / total;

          if (fpsRef.current) {
            fpsRef.current.textContent = Math.round(fps); // Atualiza o display de FPS
          }
        }
        prevTime = Date.now(); // Atualiza o tempo da última frame
      })
      .catch((e) => {
        console.log("Erro detectado", e); // Em caso de erro, continua o loop
        requestAnimationFrame(detectFrame);
      });
  };

  // Renderização do componente
  return (
    <div className="fire-detection-container">
      <div id="container" ref={containerRef}>
        <div id="loading">Carregando modelo...</div> {/* Mensagem de carregamento */}
        <video id="video" ref={videoRef} autoPlay muted playsInline></video> {/* Vídeo da webcam */}
        <canvas id="overlay" ref={canvasRef}></canvas> {/* Canvas para overlay das predições */}
        <div id="fps" ref={fpsRef}></div> {/* Exibição de FPS */}
      </div>
    </div>
  );
};

export default FireDetection; // Exporta o componente
