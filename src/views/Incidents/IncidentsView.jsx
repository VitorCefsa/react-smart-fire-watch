import React, { useEffect, useState } from 'react';
import './IncidentsView.css';

const IncidentsView = () => {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({
    data: '',
    hora: '',
    confianca: ''
  });

  const uniqueValues = (key) => [...new Set(incidents.map(item => item[key]))];

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('http://localhost:3333/logs');
        const data = await res.json();

        const formatados = data.map((item) => {
          const [ano, mes, dia] = item.data.split('-');
          return {
            id: item.id,
            data: `${dia}/${mes}/${ano}`,
            hora: item.hora,
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

  const applyFilters = (item) => {
    const confPercent = (item.confianca * 100).toFixed(2);

    return (
      (filters.data === '' || item.data === filters.data) &&
      (filters.hora === '' || item.hora >= filters.hora) &&
      (filters.confianca === '' || confPercent >= parseFloat(filters.confianca))
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="incidents-container">
      <h2 className="incidents-title">Incidentes Registrados</h2>

      <div className="filters">
        <select name="data" onChange={handleChange} value={filters.data}>
          <option value="">Filtrar por data</option>
          {uniqueValues("data").map((val, i) => <option key={i} value={val}>{val}</option>)}
        </select>

        <input
          type="time"
          name="hora"
          value={filters.hora}
          onChange={handleChange}
          placeholder="Hora mínima"
        />

        <input
          type="number"
          name="confianca"
          value={filters.confianca}
          onChange={handleChange}
          placeholder="Confiança mínima (%)"
          step="0.01"
        />
      </div>

      <div className="table-wrapper">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Confiança</th>
            </tr>
          </thead>
          <tbody>
            {incidents.filter(applyFilters).map((item) => (
              <tr key={item.id}>
                <td>{item.data}</td>
                <td>{item.hora}</td>
                <td className={
                  item.confianca >= 0.9 ? 'high-confidence' :
                  item.confianca >= 0.7 ? 'medium-confidence' :
                  'low-confidence'
                }>
                  {item.confianca != null ? `${(item.confianca * 100).toFixed(2)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentsView;
