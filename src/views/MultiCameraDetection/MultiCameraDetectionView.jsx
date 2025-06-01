import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { getCameras, addCamera, updateCamera, deleteCamera } from "../../services/cameraService";

export default function MultiCameraDetectionView() {
  const [cameras, setCameras] = useState([]);
  const [newCamera, setNewCamera] = useState({ nome: "", ip: "" });
  const [editingCameraId, setEditingCameraId] = useState(null);
  const [editCamera, setEditCamera] = useState({ nome: "", ip: "" });
  const [imgTimestamps, setImgTimestamps] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    async function fetchCameras() {
      const data = await getCameras();
      setCameras(data);
    }
    fetchCameras();
  }, []);

  const captureWebcamFrame = (videoElement) => {
    if (!videoElement || !videoElement.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");
  };

  const salvarImagemBase64 = async (imageBase64, nomeArquivo) => {
    try {
      const response = await fetch(`http://localhost:3333/capturas/${nomeArquivo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, filename: nomeArquivo }) // Enviar os dois!
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("❌ Erro na API:", result);
      } else {
        console.log("✅ Imagem salva:", nomeArquivo);
      }
    } catch (err) {
      console.error("❌ Erro ao salvar imagem:", err.message);
    }
  };

  const handleAddCamera = async () => {
    if (newCamera.nome && newCamera.ip) {
      await addCamera(newCamera);
      setNewCamera({ nome: "", ip: "" });
      const data = await getCameras();
      setCameras(data);
    }
  };

  const handleSaveEditCamera = async (id) => {
    await updateCamera(id, editCamera);
    setEditingCameraId(null);
    setEditCamera({ nome: "", ip: "" });
    const data = await getCameras();
    setCameras(data);
  };

  const handleDeleteCamera = async (id) => {
    await deleteCamera(id);
    const data = await getCameras();
    setCameras(data);
  };

  useEffect(() => {
    const webcam = cameras.find((c) => c.ip === "local");
    if (webcam && videoRefs.current[webcam.id]) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRefs.current[webcam.id].srcObject = stream;
      }).catch((err) => {
        console.warn("❌ Não foi possível acessar a webcam:", err.message);
      });
    }
  }, [cameras]);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      for (const camera of cameras) {
        let imageBase64 = null;

        if (camera.ip === "local") {
          const video = videoRefs.current[camera.id];
          imageBase64 = captureWebcamFrame(video);
        } else {
          setImgTimestamps((prev) => ({ ...prev, [camera.id]: Date.now() }));
          const img = videoRefs.current[camera.id];
          if (img) {
            await new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = resolve;
              img.onerror = resolve;
            });
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || 320;
            canvas.height = img.naturalHeight || 240;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");
          }
        }

        if (imageBase64) {
          const nomeArquivo = `${camera.nome}_${uuidv4()}.jpg`;
          await salvarImagemBase64(imageBase64, nomeArquivo);
        }
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, [cameras]);

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 24 }}>
      <h2>Multi Detecção de Câmeras</h2>
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nome"
          value={newCamera.nome}
          onChange={(e) => setNewCamera({ ...newCamera, nome: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder='Endereço IP ou "local"'
          value={newCamera.ip}
          onChange={(e) => setNewCamera({ ...newCamera, ip: e.target.value })}
          style={{ marginRight: 8, width: 300 }}
        />
        <button onClick={handleAddCamera}>Adicionar Câmera</button>
      </div>
      <div>
        {cameras.map((cam) => (
          <div
            key={cam.id}
            style={{ marginBottom: 24, border: "1px solid #444", borderRadius: 6, padding: 12 }}
          >
            <div>
              <b>{cam.nome}</b>
              {editingCameraId === cam.id ? (
                <>
                  <input
                    type="text"
                    value={editCamera.nome}
                    onChange={(e) => setEditCamera({ ...editCamera, nome: e.target.value })}
                    style={{ marginLeft: 8, marginRight: 4 }}
                  />
                  <input
                    type="text"
                    value={editCamera.ip}
                    onChange={(e) => setEditCamera({ ...editCamera, ip: e.target.value })}
                    style={{ marginRight: 4 }}
                  />
                  <button onClick={() => handleSaveEditCamera(cam.id)} style={{ background: "#388e3c", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", marginRight: 4 }}>Salvar</button>
                  <button onClick={() => setEditingCameraId(null)} style={{ background: "#b71c1c", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px" }}>Cancelar</button>
                </>
              ) : (
                <>
                  <button style={{ marginLeft: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px" }} onClick={() => { setEditingCameraId(cam.id); setEditCamera({ nome: cam.nome, ip: cam.ip }); }}>Editar</button>
                  <button style={{ marginLeft: 8, background: "#b71c1c", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px" }} onClick={() => handleDeleteCamera(cam.id)}>Excluir</button>
                </>
              )}
            </div>
            {cam.ip === "local" ? (
              <video ref={(el) => (videoRefs.current[cam.id] = el)} autoPlay width={320} height={240} style={{ background: "#000" }} />
            ) : (
              <img ref={(el) => (videoRefs.current[cam.id] = el)} src={cam.ip + "?t=" + (imgTimestamps[cam.id] || "")} alt={cam.nome} width={320} height={240} style={{ background: "#000" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
