import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchDashboardData } from './DashboardViewModel';
import './DashboardView.css';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

const DashboardView = () => {
  const [data, setData] = useState({
    porDia: [],
    porTipo: [],
    porLocal: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const carregar = async () => {
      try {
        const { porDia, porTipo, porLocal } = await fetchDashboardData();
        setData({
          porDia,
          porTipo,
          porLocal,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: "Falha ao carregar dados"
        }));
      }
    };
    carregar();
  }, []);

  if (data.loading) return <div className="loading-spinner">Carregando...</div>;
  if (data.error) return <div className="error-message">{data.error}</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard de Incidentes</h2>

      <div className="chart-section">
        <h3>📆 Incidentes por Dia</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.porDia}>
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.porTipo.length > 0 && (
        <div className="chart-section">
          <h3>🔥 Incidentes por Tipo</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.porTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.porTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {data.porLocal.length > 0 && (
        <div className="chart-section">
          <h3>📍 Incidentes por Local</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.porLocal}>
                <XAxis dataKey="local" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;