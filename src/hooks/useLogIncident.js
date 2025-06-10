import { useRef } from 'react'; // Importa o hook useRef do React para armazenar valores que persistem entre renderizações

export function useLogIncident() {
  const ultimoLogEnviado = useRef(null); // Armazena a chave do último log enviado para evitar envios duplicados

  // Função responsável por enviar um log de incidente
  const enviarLog = async (obj, origem = 'webcam', imagemBase64 = null, local = 'Desconhecido') => {
    const agora = new Date(); // Obtém a data e hora atuais

    // Monta os dados do log com base nas informações fornecidas
    const logData = {
      data: agora.toISOString().slice(0, 10), // Data no formato YYYY-MM-DD
      hora: agora.toTimeString().slice(0, 8), // Hora no formato HH:MM:SS
      camera_id: origem, // Identificador da câmera ou origem
      local, // Localização do incidente
      tipo_incidente: obj.class, // Tipo de incidente detectado
      confianca: obj.confidence, // Nível de confiança da detecção
      imagem_base64: imagemBase64 // Imagem codificada em base64 (opcional)
    };

    // Gera uma chave única baseada na data, hora e tipo do incidente
    const chave = `${logData.data}_${logData.hora}_${logData.tipo_incidente}`;

    // Verifica se a confiança é alta o suficiente e se esse log já não foi enviado
    if (obj.confidence > 0.7 && chave !== ultimoLogEnviado.current) {
      ultimoLogEnviado.current = chave; // Atualiza a referência do último log enviado
      console.log('🚀 Enviando log do incidente:', logData); // Loga no console os dados que serão enviados

      try {
        // Envia os dados para o servidor via requisição HTTP POST
        const response = await fetch('http://localhost:3333/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData) // Converte os dados para JSON
        });
        const json = await response.json(); // Aguarda a resposta do servidor e converte para JSON
        console.log('✅ Log enviado:', json); // Exibe no console a confirmação do envio
      } catch (error) {
        console.error('❌ Erro ao enviar log:', error); // Exibe erro no console em caso de falha
      }
    }
  };

  return { enviarLog }; // Retorna a função para ser utilizada em outros componentes
}
