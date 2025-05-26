import React, { useEffect, useState } from 'react';
import './IncidentsView.css';

const IncidentsView = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('http://localhost:3333/logs');
        const data = await res.json();

const formatados = data.map((item) => {
  const [ano, mes, dia] = item.data.split('-');
  return {
    id: item.id,
    data: `${dia}/${mes}/${ano}`, // ← data formatada para o BR
    hora: item.hora,
    camera_id: item.camera_id,
    local: item.local,
    tipo_incidente: item.tipo_incidente,
    confianca: item.confianca
  };
});


        setIncidents(formatados);
      } catch (err) {
        console.error('Erro ao carregar logs:', err);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <div className="incidents-container">
      <h2 className="incidents-title">Incidentes Registrados</h2>
      <div className="table-wrapper">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Câmera</th>
              <th>Local</th>
              <th>Tipo</th>
              <th>Confiança</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((item) => (
              <tr key={item.id}>
                <td>{item.data}</td>
                <td>{item.hora}</td>
                <td>{item.camera_id}</td>
                <td>{item.local}</td>
                <td>{item.tipo_incidente}</td>
                <td>{item.confianca != null ? `${(item.confianca * 100).toFixed(2)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentsView;
