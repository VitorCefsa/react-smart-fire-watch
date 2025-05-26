import React, { useState, useRef, useEffect } from "react";
import { getCameras, addCamera, updateCamera, deleteCamera } from '../../services/cameraService';

async function logarIncidente(camera, confidence) {
  try {
    await fetch("http://localhost:3333/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        camera_id: camera.id,
        local: camera.nome,
        tipo_incidente: "Fogo",
        confianca: confidence,
        data: new Date().toISOString().slice(0, 10),
        hora: new Date().toTimeString().slice(0, 8)
      })
    });
  } catch (err) {}
}

export default function MultiCameraDetectionView() {
  const [cameras, setCameras] = useState([]);
  const [results, setResults] = useState({});
  const [newCamera, setNewCamera] = useState({ nome: "", ip: "" });
  const [editingCameraId, setEditingCameraId] = useState(null);
  const [editCamera, setEditCamera] = useState({ nome: "", ip: "" });
  const [imgTimestamps, setImgTimestamps] = useState({});
  const [currentCameraIdx, setCurrentCameraIdx] = useState(0);
  const videoRefs = useRef({});

  // Carregar câmeras ao abrir a tela
  useEffect(() => {
    async function fetchCameras() {
      const data = await getCameras();
      setCameras(data);
    }
    fetchCameras();
  }, []);

  // Adicionar câmera
  const handleAddCamera = async () => {
    if (newCamera.nome && newCamera.ip) {
      await addCamera(newCamera);
      setNewCamera({ nome: "", ip: "" });
      const data = await getCameras();
      setCameras(data);
    }
  };

  // Editar e salvar câmera
  const handleSaveEditCamera = async (id) => {
    await updateCamera(id, editCamera);
    setEditingCameraId(null);
    setEditCamera({ nome: "", ip: "" });
    const data = await getCameras();
    setCameras(data);
  };

  // Excluir câmera
  const handleDeleteCamera = async (id) => {
    await deleteCamera(id);
    const data = await getCameras();
    setCameras(data);
  };

  // Função para capturar frame da webcam local
  const captureWebcamFrame = (videoElement) => {
    if (!videoElement || !videoElement.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, "");
  };

  // Inicializa webcam local automaticamente
  useEffect(() => {
    const webcam = cameras.find(c => c.ip === "local");
    if (webcam && videoRefs.current[webcam.id]) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        videoRefs.current[webcam.id].srcObject = stream;
      }).catch(() => {});
    }
  }, [cameras]);

  // Loop round robin de inferência
  useEffect(() => {
    let intervalId = null;
    if (cameras.length > 0) {
      intervalId = setInterval(async () => {
        let idx = currentCameraIdx;
        const camera = cameras[idx];

        // Para IP, força recarregar frame (só funciona se for snapshot JPG, não MJPEG)
        if (camera.ip !== "local") {
          setImgTimestamps(prev => ({
            ...prev,
            [camera.id]: Date.now()
          }));
        }

        let imageBase64 = null;
        if (camera.ip === "local") {
          const video = videoRefs.current[camera.id];
          imageBase64 = captureWebcamFrame(video);
        } else {
          const img = videoRefs.current[camera.id];
          if (img) {
            await new Promise(resolve => {
              if (img.complete) return resolve();
              img.onload = resolve;
              img.onerror = resolve;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 320;
            canvas.height = img.naturalHeight || 240;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, "");
          }
        }

        if (imageBase64) {
          try {
            const response = await fetch(
              "https://serverless.roboflow.com/smartfirewatch_modelo_5/1?api_key=H8ZX6BgARrnWxbwjHfhu",
              {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: imageBase64
              }
            );
            const result = await response.json();

            if (result && result.predictions && result.predictions.length > 0) {
              const confidence = result.predictions[0].confidence;
              setResults(prev => ({
                ...prev,
                [camera.id]: `🔥 Fogo detectado! Confiança: ${(confidence * 100).toFixed(2)}%`
              }));
              await logarIncidente(camera, confidence);
            } else {
              setResults(prev => ({
                ...prev,
                [camera.id]: "Nenhum incêndio detectado."
              }));
            }
          } catch (error) {
            setResults(prev => ({
              ...prev,
              [camera.id]: "Erro na inferência"
            }));
          }
        }

        // Avança para próxima câmera
        setCurrentCameraIdx((prev) => (prev + 1) % cameras.length);
      }, 1500); // A cada 1,5s, troca de câmera (ajuste como quiser)
    }
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [cameras, currentCameraIdx]);

  // Renderização
  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 24 }}>
      <h2>Multi Detecção de Câmeras</h2>
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nome"
          value={newCamera.nome}
          onChange={e => setNewCamera({ ...newCamera, nome: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder='Endereço IP ou URL (ex: http://192.168.0.195:4747/video ou "local")'
          value={newCamera.ip}
          onChange={e => setNewCamera({ ...newCamera, ip: e.target.value })}
          style={{ marginRight: 8, width: 300 }}
        />
        <button onClick={handleAddCamera}>Adicionar Câmera</button>
      </div>
      <div>
        {cameras.map(cam => (
          <div key={cam.id} style={{ marginBottom: 24, border: "1px solid #444", borderRadius: 6, padding: 12 }}>
            <div>
              <b>{cam.nome}</b>
              {editingCameraId === cam.id ? (
                <>
                  <input
                    type="text"
                    value={editCamera.nome}
                    onChange={e => setEditCamera({ ...editCamera, nome: e.target.value })}
                    style={{ marginLeft: 8, marginRight: 4 }}
                  />
                  <input
                    type="text"
                    value={editCamera.ip}
                    onChange={e => setEditCamera({ ...editCamera, ip: e.target.value })}
                    style={{ marginRight: 4 }}
                  />
                  <button onClick={() => handleSaveEditCamera(cam.id)} style={{ background: "#388e3c", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", marginRight: 4 }}>Salvar</button>
                  <button onClick={() => setEditingCameraId(null)} style={{ background: "#b71c1c", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px" }}>Cancelar</button>
                </>
              ) : (
                <>
                  <button
                    style={{ marginLeft: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px" }}
                    onClick={() => {
                      setEditingCameraId(cam.id);
                      setEditCamera({ nome: cam.nome, ip: cam.ip });
                    }}
                  >Editar</button>
                  <button
                    style={{ marginLeft: 8, background: "#b71c1c", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px" }}
                    onClick={() => handleDeleteCamera(cam.id)}
                  >Excluir</button>
                </>
              )}
            </div>
            {cam.ip === "local" ? (
              <video
                ref={el => videoRefs.current[cam.id] = el}
                autoPlay
                width={320}
                height={240}
                style={{ background: "#000" }}
              />
            ) : (
              <img
                ref={el => videoRefs.current[cam.id] = el}
                src={cam.ip + "?t=" + (imgTimestamps[cam.id] || "")}
                alt={cam.nome}
                width={320}
                height={240}
                style={{ background: "#000" }}
              />
            )}
            <div style={{ color: "#ff9800", marginTop: 8 }}>
              {results[cam.id] || "Aguardando detecção..."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
