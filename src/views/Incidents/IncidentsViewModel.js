export async function fetchIncidentsFromAPI() {
  try {
    const response = await fetch('http://localhost:3333/logs');
    const data = await response.json();

    return data.map(log => ({
      id: log.id,
      timestamp: log.createdAt, // usa createdAt direto
      camera: log.camera_id || '—',
      confidence: isNaN(Number(log.confianca)) ? null : Number(log.confianca),
      status: 'Não resolvido'
    }));
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return [];
  }
}
