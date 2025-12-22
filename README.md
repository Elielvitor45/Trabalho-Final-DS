## ✅ Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Docker** (necessários para subir o backend com containers)
- **Node.js** (necessários para gerenciar dependências do frontend)
- **Angular CLI** (para executar o servidor de desenvolvimento do frontend)

Instalação da Angular CLI (caso ainda não tenha):

npm install -g @angular/cli

---

## 🐳 Executando o Backend (Docker)

O backend é executado via Docker Compose a partir da **raiz do projeto**.

Na raiz do projeto, execute:

docker compose up --build

Esse comando irá criar e iniciar os containers definidos no `docker-compose.yml`, reconstruindo as imagens para aplicar alterações recentes no código.

Para parar os containers:

docker compose down

---

## 💻 Executando o Frontend (Angular)

O frontend está localizado na pasta `frontend`.

1. Acesse a pasta do frontend:

cd frontend

2. Instale as dependências:

npm install

3. Inicie o servidor de desenvolvimento:

ng serve

Por padrão, a aplicação ficará disponível em: [**http://localhost:4200**](http://localhost:4200)

---

## 📂 Estrutura do Projeto

.
├── .vscode/
├── backend/
├── frontend/
├── .env
├── .env.properties
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
└── README.md

- `backend/`: Código e configuração do servidor (API)
- `frontend/`: Aplicação Angular (interface do usuário)
- `docker-compose.yml`: Definição dos serviços Docker
- `Dockerfile`: Instruções para construir a imagem do backend

---

## 🔎 Observações

- Execute `docker compose up --build` sempre na **raiz do projeto**
- Verifique se as portas necessárias (ex: 4200 para Angular) estão livres
- Após alterações no backend, rode novamente com `--build` para atualizar as imagens
- Pressione `Ctrl + C` para parar o servidor Angular
