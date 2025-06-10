# SmartFireWatch Web

Interface web do projeto **SmartFireWatch**, desenvolvida em React. Esta aplicação possui duas telas principais: uma para realizar inferência (captura e detecção de fogo) e outra para listar os incidentes detectados pelo sistema.

## 🌐 Funcionalidades

- Captura de imagem da câmera do navegador
- Inferência em tempo real utilizando modelo de detecção
- Envio automático de logs com imagem e metadados
- Listagem de incidentes registrados
- Visualização da imagem do momento da detecção
- Comunicação em tempo real com Socket.IO

## 🧱 Tecnologias Utilizadas

- **React**
- **Vite**
- **Axios** para consumo da API
- **TailwindCSS** para estilização
- **React Router** para navegação entre telas
- **Socket.IO Client** para comunicação em tempo real

## ▶️ Como Executar

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` com:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

3. Inicie a aplicação:

```bash
npm run dev
```

> Certifique-se de que a API e o servidor Socket.IO estão em execução.

## 📁 Estrutura Esperada do Projeto

```
react-smart-fire-watch/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── FireCard.jsx
│   ├── pages/
│   │   ├── InferencePage.jsx
│   │   └── IncidentsPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── sockets/
│   │   └── socket.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── README.md
```

## 🚧 Funcionalidades Futuras

- Gráficos e dashboards analíticos
- Autenticação de usuários
- Notificações no navegador
- Histórico de eventos por data/câmera


---

Esta aplicação faz parte do sistema **SmartFireWatch**, focado na detecção de incêndios com inteligência artificial e resposta rápida.