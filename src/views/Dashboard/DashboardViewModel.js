// src/views/Dashboard/DashboardViewModel.js

export async function fetchDashboardData() {
  const baseURL = 'http://localhost:3333/dashboard';

  const fetchData = async (endpoint) => {
    try {
      const res = await fetch(`${baseURL}/${endpoint}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
      return [];
    }
  };

  const [porDia, porTipo, porLocal] = await Promise.all([
    fetchData('por-dia'),
    fetchData('por-tipo'),
    fetchData('por-local')
  ]);

  return {
    porDia,
    porTipo,
    porLocal
  };
}
