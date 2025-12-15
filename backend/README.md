# Locadora Project (Spring Boot + MySQL + Angular)

API REST para sistema de locação, com autenticação via **JWT** (expira em **10 minutos**).

---

## 🚀 Como rodar (Docker)

```bash
docker-compose up --build
```

### Serviços

- **Backend:** [http://localhost:8080](http://localhost:8080)
- **Frontend (Angular via Nginx):** [http://localhost:4200](http://localhost:4200)
- **MySQL:** localhost:3307 (host) → 3306 (container)

---

## 🔐 Autenticação (JWT)

- Login é feito por **email + senha**.
- Após login/registro, a API retorna um **token JWT**.
- Para acessar rotas protegidas, enviar o header:

```
Authorization: Bearer <TOKEN>
```

### ⏱️ Expiração do Token

- O backend foi configurado para expirar em **600000 ms (10 minutos)**.
- Se o frontend receber **401 Unauthorized**, deve realizar login novamente e obter um novo token.

---

## 🌐 Base URL (Angular)

No Angular, configure:

```ts
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

👉 Recomendado usar um **HttpInterceptor** para anexar o token em todas as requisições (exceto login/register).

### Exemplo de Header no Angular

```ts
headers: { Authorization: `Bearer ${token}` }
```

---

## 📌 Rotas da API

### 🔑 AuthController (`/api/auth`)

#### POST `/api/auth/register` (Público)

Cria usuário e retorna token.

**Body:**

```json
{
  "nome": "Maria Santos",
  "cpf": "98765432100",
  "email": "maria@email.com",
  "senha": "senha123",
  "telefone": "11987654321",
  "endereco": {
    "cep": "01310100",
    "logradouro": "Av Paulista",
    "numero": "1578",
    "complemento": "Sala 305",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "estado": "SP"
  }
}
```

**Resposta (AuthResponse):**

```json
{
  "token": "JWT_AQUI",
  "tipo": "Bearer",
  "id": 1,
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "expiresIn": 600000
}
```

---

#### POST `/api/auth/login` (Público)

Login por email e senha.

**Body:**

```json
{
  "email": "maria@email.com",
  "senha": "senha123"
}
```

**Resposta:** igual ao `register`.

---

#### GET `/api/auth/test` (Público)

Teste rápido:

- **Resposta:** `API funcionando!`

---

## 👤 UsuarioController (`/api/usuarios`) — Protegido

Todas as rotas exigem:

```
Authorization: Bearer {{token}}
```

### GET `/api/usuarios/perfil`

Retorna o usuário autenticado (sem senha).

**Resposta:**

```json
{
  "id": 1,
  "nome": "Maria Santos",
  "cpf": "98765432100",
  "email": "maria@email.com",
  "senha": null,
  "telefone": "11987654321",
  "dataNascimento": null,
  "endereco": {
    "id": 1,
    "cep": "04567890",
    "logradouro": "Rua Augusta",
    "numero": "2000",
    "complemento": "Apto 102",
    "bairro": "Consolação",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "ativo": true
}
```

---

### PUT `/api/usuarios/endereco`

Atualiza (ou cria) o endereço do usuário.

**Body (EnderecoDTO):**

```json
{
  "cep": "04567890",
  "logradouro": "Rua Augusta",
  "numero": "2000",
  "complemento": "Apto 102",
  "bairro": "Consolação",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

---

### GET `/api/usuarios/locacoes`

Retorna o histórico de locações do usuário autenticado.

**Resposta:** `LocacaoDTO[]`

---

### GET `/api/usuarios/estatisticas`

Retorna estatísticas do usuário.

```json
{
  "totalLocacoes": 2,
  "locacoesAtivas": 1,
  "locacoesFinalizadas": 1,
  "valorTotalGasto": 675.0
}
```

---

## 🚗 VeiculoController (`/api/veiculos`)

### GET `/api/veiculos` (Público)

Lista todos os veículos.

### GET `/api/veiculos/disponiveis` (Público)

Lista apenas os veículos disponíveis.

### GET `/api/veiculos/{id}` (Público)

Busca veículo por ID.

### GET `/api/veiculos/categoria/{categoria}` (Público)

Busca veículos por categoria.

---

### POST `/api/veiculos` (Protegido)

Cria veículo.

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body (VeiculoCreateDTO):**

```json
{
  "modelo": "Fiat Argo 1.0",
  "marca": "Fiat",
  "placa": "ABC1234",
  "ano": 2023,
  "categoria": "Econômico",
  "valorDiaria": 120.00,
  "descricao": "Carro econômico ideal para cidade"
}
```

**Resposta (VeiculoDTO):**

```json
{
  "id": 1,
  "modelo": "Fiat Argo 1.0",
  "marca": "Fiat",
  "placa": "ABC1234",
  "ano": 2023,
  "categoria": "Econômico",
  "valorDiaria": 120.00,
  "disponivel": true,
  "descricao": "Carro econômico ideal para cidade"
}
```

---

### PUT `/api/veiculos/{id}` (Protegido)

Atualiza veículo.

### DELETE `/api/veiculos/{id}` (Protegido)

Remove veículo.

### PATCH `/api/veiculos/{id}/disponibilidade?disponivel=true|false` (Protegido)

Altera disponibilidade do veículo.

---

## 📄 LocacaoController (`/api/locacoes`) — Protegido

Todas as rotas exigem:

```
Authorization: Bearer <token>
```

### POST `/api/locacoes`

Cria uma locação para o usuário autenticado e marca o veículo como indisponível.

**Body (LocacaoCreateDTO):**

```json
{
  "veiculoId": 1,
  "dataRetirada": "2025-12-20",
  "dataDevolucao": "2025-12-25",
  "observacoes": "Viagem para praia"
}
```

**Resposta (LocacaoDTO):**

```json
{
  "id": 1,
  "dataRetirada": "2025-12-20",
  "dataDevolucao": "2025-12-25",
  "observacoes": "Viagem para praia",
  "valorTotal": 600.00,
  "status": "ATIVA",
  "veiculo": { "...": "..." },
  "usuario": { "...": "..." }
}
```

---

### Outras rotas de Locação

- GET `/api/locacoes/minhas`
- GET `/api/locacoes/minhas/ativas`
- GET `/api/locacoes/minhas/finalizadas`
- GET `/api/locacoes/{id}`
- PATCH `/api/locacoes/{id}/finalizar`
- PATCH `/api/locacoes/{id}/cancelar`

### GET `/api/locacoes/resumo`

```json
{
  "total": 2,
  "ativas": 1,
  "finalizadas": 1,
  "canceladas": 0,
  "valorTotalGasto": 675.0
}
```

---

## 🔄 Integração Angula

- Register/Login → salvar token no **localStorage**.
- Usar **HttpInterceptor** para adicionar o header `Authorization`.

### Tela Perfil

- GET `/api/usuarios/perfil`
- GET `/api/usuarios/locacoes`
- PUT `/api/usuarios/endereco`

### Home / Lista de Veículos

- GET `/api/veiculos/disponiveis` (público)

### Criar Locação

- POST `/api/locacoes` (privado)

---

## 🌍 CORS (Dev)

Se o frontend estiver em `http://localhost:4200`, o backend deve permitir essa origem via configuração **CORS no Spring Security**.

---

## ✅ Checklist rápido (Insomnia)

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/usuarios/perfil` (com Bearer)
- POST `/api/veiculos` (com Bearer)
- GET `/api/veiculos/disponiveis` (sem Bearer)
- POST `/api/locacoes` (com Bearer)
- GET `/api/usuarios/locacoes` (com Bearer)

