import React, { useEffect, useState } from 'react';
import './IPCameraSelector.css';

const IPCameraSelector = () => {
  const [cameras, setCameras] = useState([]);
  const [cameraSelecionada, setCameraSelecionada] = useState('');
  const [cameraEdicao, setCameraEdicao] = useState(null);
  const [novaCamera, setNovaCamera] = useState({
    nome: '',
    ip: '',
    protocolo: 'RTSP',
    porta: '',
    caminho: '',
    local: ''
  });

  useEffect(() => {
    carregarCameras();
  }, []);

  useEffect(() => {
    const camera = cameras.find((c) => c.id == cameraSelecionada);
    setCameraEdicao(camera || null);

    const video = document.getElementById('webcam-preview');
    if (camera?.protocolo === 'WEB') {
      video.style.display = 'block';
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((err) => {
          console.error('Erro ao acessar webcam:', err);
          alert('Erro ao acessar webcam');
        });
    } else {
      video.style.display = 'none';
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    }
  }, [cameraSelecionada]);

  const carregarCameras = async () => {
    try {
      const res = await fetch('http://localhost:3333/cameras');
      const data = await res.json();
      setCameras(data);
      if (data.length > 0) setCameraSelecionada(data[0].id);
    } catch (error) {
      console.error('Erro ao carregar câmeras:', error);
    }
  };

  const adicionarCamera = async () => {
    try {
      const res = await fetch('http://localhost:3333/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaCamera)
      });
      if (res.ok) {
        setNovaCamera({
          nome: '',
          ip: '',
          protocolo: 'RTSP',
          porta: '',
          caminho: '',
          local: ''
        });
        carregarCameras();
      }
    } catch (err) {
      console.error('Erro ao adicionar câmera:', err);
    }
  };

  const salvarEdicao = async () => {
    try {
      const res = await fetch(`http://localhost:3333/cameras/${cameraEdicao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cameraEdicao)
      });
      if (res.ok) {
        alert('Câmera atualizada com sucesso!');
        carregarCameras();
      }
    } catch (err) {
      console.error('Erro ao editar câmera:', err);
    }
  };

  const excluirCamera = async () => {
    const confirma = window.confirm('Deseja excluir esta câmera?');
    if (!confirma) return;
    try {
      const res = await fetch(`http://localhost:3333/cameras/${cameraSelecionada}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Câmera excluída!');
        setCameraSelecionada('');
        setCameraEdicao(null);
        carregarCameras();
      }
    } catch (err) {
      console.error('Erro ao excluir câmera:', err);
    }
  };

  return (
    <div className="ip-camera-selector">
      <h2>Seleção de Câmera IP</h2>

      <select
        value={cameraSelecionada}
        onChange={(e) => setCameraSelecionada(e.target.value)}
      >
        <option value="">Selecione uma câmera</option>
        {cameras.map((cam) => (
          <option key={cam.id} value={cam.id}>
            {cam.nome} ({cam.protocolo})
          </option>
        ))}
      </select>

      {cameraEdicao && (
        <>
          <h3>Editar Câmera Selecionada</h3>
          <input
            placeholder="Nome"
            value={cameraEdicao.nome}
            onChange={(e) => setCameraEdicao({ ...cameraEdicao, nome: e.target.value })}
          />
          <input
            placeholder="IP"
            value={cameraEdicao.ip}
            onChange={(e) => setCameraEdicao({ ...cameraEdicao, ip: e.target.value })}
          />
          <select
            value={cameraEdicao.protocolo}
            onChange={(e) => setCameraEdicao({ ...cameraEdicao, protocolo: e.target.value })}
          >
            <option value="RTSP">RTSP</option>
            <option value="HTTP">HTTP</option>
            <option value="WEB">WEB</option>
          </select>
          <input
            placeholder="Porta"
            value={cameraEdicao.porta}
            onChange={(e) => setCameraEdicao({ ...cameraEdicao, porta: e.target.value })}
          />
          <input
            placeholder="Caminho"
            value={cameraEdicao.caminho}
            onChange={(e) => setCameraEdicao({ ...cameraEdicao, caminho: e.target.value })}
          />
          <input
            placeholder="Local"
            value={cameraEdicao.local}
            onChange={(e) => setCameraEdicao({ ...cameraEdicao, local: e.target.value })}
          />

          <button onClick={salvarEdicao}>Salvar Alterações</button>
          <button onClick={excluirCamera} style={{ backgroundColor: 'crimson', marginLeft: '10px' }}>
            Excluir Câmera
          </button>
        </>
      )}

      <h3>Adicionar Nova Câmera</h3>
      <input
        placeholder="Nome"
        value={novaCamera.nome}
        onChange={(e) => setNovaCamera({ ...novaCamera, nome: e.target.value })}
      />
      <input
        placeholder="IP"
        value={novaCamera.ip}
        onChange={(e) => setNovaCamera({ ...novaCamera, ip: e.target.value })}
      />
      <select
        value={novaCamera.protocolo}
        onChange={(e) => setNovaCamera({ ...novaCamera, protocolo: e.target.value })}
      >
        <option value="RTSP">RTSP</option>
        <option value="HTTP">HTTP</option>
        <option value="WEB">WEB</option>
      </select>
      <input
        placeholder="Porta"
        value={novaCamera.porta}
        onChange={(e) => setNovaCamera({ ...novaCamera, porta: e.target.value })}
      />
      <input
        placeholder="Caminho"
        value={novaCamera.caminho}
        onChange={(e) => setNovaCamera({ ...novaCamera, caminho: e.target.value })}
      />
      <input
        placeholder="Local"
        value={novaCamera.local}
        onChange={(e) => setNovaCamera({ ...novaCamera, local: e.target.value })}
      />

      <button onClick={adicionarCamera}>Adicionar Câmera</button>

      <div className="visualizacao-camera">
        <h4>Visualização da Câmera</h4>
        <video
          id="webcam-preview"
          autoPlay
          muted
          playsInline
          style={{ display: 'none', width: '100%', marginTop: '10px', border: '1px solid #ccc' }}
        ></video>
      </div>
    </div>
  );
};

export default IPCameraSelector;
