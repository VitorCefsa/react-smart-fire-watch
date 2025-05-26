let ultimoLogEnviado = null;

export async function carregarInferenceJs() {
  return new Promise((resolve) => {
    if (window.inferencejs) return resolve();

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/inferencejs';
    script.async = true;
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

export async function startYOLOInference(video, canvas, setProcessing) {
  await carregarInferenceJs();

  const { InferenceEngine, CVImage } = window.inferencejs;
  const engine = new InferenceEngine();

  const ctx = canvas.getContext('2d');
  const workerId = await engine.startWorker(
    'tcc_fire_detection_model_v3',
    '1',
    'rf_4gGK3G6jA9OmMcm8Dpq76MOVBjI3'
  );

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const draw = async () => {
  console.log('🎥 draw() executando...');

  if (video.paused || video.ended) {
    setProcessing(false);
    console.log('⏹️ Vídeo pausado ou encerrado');
    return;
  }

  const image = new CVImage(video);
  const result = await engine.infer(workerId, image);
  console.log('📦 Resultado da inferência:', result);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (result?.objects?.length) {
    console.log(`📸 ${result.objects.length} objeto(s) detectado(s)`);

    result.objects.forEach(async (obj) => {
      const [x, y, width, height] = obj.bbox;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(`${obj.class} ${(obj.confidence * 100).toFixed(1)}%`, x, y > 10 ? y - 5 : 10);

      const agora = new Date();
      const logData = {
        data: agora.toISOString().slice(0, 10),
        hora: agora.toTimeString().slice(0, 8),
        camera_id: 'upload',
        local: 'Desconhecido',
        tipo_incidente: obj.class,
        confianca: obj.confidence
      };

      const chave = `${logData.data}_${logData.hora}_${logData.tipo_incidente}`;
      console.log('🔍 Objeto detectado:', obj);

      if (obj.confidence > 0.7 && chave !== ultimoLogEnviado) {
        console.log('🚀 Enviando log:', logData);
        ultimoLogEnviado = chave;

        try {
          const response = await fetch('http://localhost:3333/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
          });
          const json = await response.json();
          console.log('✅ Log enviado com sucesso:', json);
        } catch (error) {
          console.error('❌ Erro ao enviar log:', error);
        }
      }
    });
  } else {
    console.log('🚫 Nenhum objeto detectado');
  }

  requestAnimationFrame(draw);
};


  requestAnimationFrame(draw);

  // Teste forçado para garantir que a API responde
  setTimeout(async () => {
    const agora = new Date();
    const fakeLog = {
      data: agora.toISOString().slice(0, 10),
      hora: agora.toTimeString().slice(0, 8),
      camera_id: 'teste',
      local: 'manual',
      tipo_incidente: 'fogo',
      confianca: 0.99
    };

    try {
      const res = await fetch('http://localhost:3333/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fakeLog)
      });
      const json = await res.json();
      console.log('🧪 Teste: log forçado enviado com sucesso', json);
    } catch (e) {
      console.error('🛑 Teste: erro ao conectar com a API', e);
    }
  }, 4000);
}
