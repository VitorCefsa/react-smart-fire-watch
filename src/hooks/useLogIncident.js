// src/hooks/useLogIncident.js
import { useRef } from 'react';

export function useLogIncident() {
  const ultimoLogEnviado = useRef(null);

  const enviarLog = async (obj, origem = 'webcam', local = 'Desconhecido') => {
    const agora = new Date();
    const logData = {
      data: agora.toISOString().slice(0, 10),
      hora: agora.toTimeString().slice(0, 8),
      camera_id: origem,
      local,
      tipo_incidente: obj.class,
      confianca: obj.confidence
    };

    const chave = `${logData.data}_${logData.hora}_${logData.tipo_incidente}`;

    if (obj.confidence > 0.7 && chave !== ultimoLogEnviado.current) {
      ultimoLogEnviado.current = chave;
      console.log('🚀 Enviando log do incidente:', logData);

      try {
        const response = await fetch('http://localhost:3333/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        const json = await response.json();
        console.log('✅ Log enviado:', json);
      } catch (error) {
        console.error('❌ Erro ao enviar log:', error);
      }
    }
  };

  return { enviarLog };
}
