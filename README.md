# SmartFireWatch Web

Interface web do projeto **SmartFireWatch**, desenvolvida em React. Esta aplicação possui duas telas principais: uma para realizar inferência (captura e detecção de fogo) e outra para listar os incidentes detectados pelo sistema.

## 📸 Funcionalidades

- **Detecção de Incêndios em Tempo Real**  
  Captura de imagem via camera e envio para análise de inferência por modelo treinado com YOLO.

- **Listagem de Incidentes Detectados**  
  Exibe histórico dos incidentes detectados, com horário, status e imagem associada.

- **Marcação de Incidentes como Resolvidos**  
  Permite encerrar alertas sonoros e visuais após verificação.

- **Atualizações em Tempo Real com WebSocket**  
  Recebimento instantâneo de novos eventos por meio do `Socket.IO`.

## 🧩 Estrutura de Telas

- `FireDetection.tsx`:  
  Interface de captura de imagens com botão de inferência e indicação visual de alerta.

- `IncidentsScreen.tsx`:  
  Tela com listagem dos incidentes detectados, com botão para marcar como resolvido.

## ⚙️ Tecnologias Utilizadas

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/) para estilização
- [Axios](https://axios-http.com/) para comunicação com a API
- [Socket.IO Client](https://socket.io/docs/v4/client-api/) para comunicação em tempo real
- [React Router DOM](https://reactrouter.com/) para navegação entre telas

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- API do projeto em execução (backend)

### Passos

1. Instale as dependências:
   ```bash
   npm install
