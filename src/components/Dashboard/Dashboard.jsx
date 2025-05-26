import React from 'react';
import { Chart } from 'chart.js/auto';
import { Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';

const Dashboard = ({ incidents }) => {
  // Dados de exemplo - substitua com seus dados reais
  const data = {
    labels: ['Incidentes'],
    datasets: [
      {
        label: 'Detecções',
        data: [incidents.length],
        backgroundColor: ['rgba(75, 192, 192, 0.6)'],
      },
    ],
    
  };

  return (
  
    <div className="dashboard">
      <h2>Dashboard de Incidentes</h2>
      
      <div className="chart-container">
        <div className="chart">
          <h3>Total de Incidentes</h3>
          <Bar data={data} />
        </div>
        
        <div className="chart">
          <h3>Distribuição</h3>
          <Pie data={data} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;