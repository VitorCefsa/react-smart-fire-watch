import React, { useEffect, useState } from "react";
import { getCameras, addCamera, updateCamera, deleteCamera } from "../services/cameraService";

export default function MultiCameraManager({ onCameraListChange }) {
  const [cameras, setCameras] = useState([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [editingId, setEditingId] = useState(null);

  // Carregar as câmeras do backend ao montar
  useEffect(() => {
    loadCameras();
  }, []);

  async function loadCameras() {
    const data = await getCameras();
    setCameras(data);
    if (onCameraListChange) onCameraListChange(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await updateCamera(editingId, form);
      setEditingId(null);
    } else {
      await addCamera(form);
    }
    setForm({ name: "", url: "" });
    loadCameras();
  }

  function handleEdit(cam) {
    setForm({ name: cam.name, url: cam.url });
    setEditingId(cam.id);
  }

  async function handleDelete(id) {
    if (window.confirm("Deseja realmente excluir esta câmera?")) {
      await deleteCamera(id);
      loadCameras();
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 16 }}>
      <h3>Gerenciar Câmeras Persistidas</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          required
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="URL"
          value={form.url}
          required
          onChange={e => setForm({ ...form, url: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <button type="submit">{editingId ? "Salvar" : "Adicionar"}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", url: "" }); }}>Cancelar</button>}
      </form>
      <ul>
        {cameras.map(cam => (
          <li key={cam.id} style={{ marginBottom: 10 }}>
            <b>{cam.name}</b> – <span>{cam.url}</span>
            <button style={{ marginLeft: 8 }} onClick={() => handleEdit(cam)}>Editar</button>
            <button style={{ marginLeft: 4 }} onClick={() => handleDelete(cam.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
