# API Back-end — Rede "Raízes do Nordeste"

API REST para uma rede de lanchonetes nordestinas em expansão, atendendo múltiplos canais
(App, Totem, Balcão, Pickup e Web). Projeto da disciplina **Projeto Multidisciplinar — Trilha Back-End**.

**Autor:** Auyber Genesini Moura — **RU:** 4705867
**GitHub:** https://github.com/auyber

O **fluxo crítico** entregue de ponta a ponta é:
**criar pedido → validar estoque → pagamento (mock) → atualização de status**, com persistência
real em banco, autenticação JWT, autorização por perfis e padrão de erro consistente.

---

## 1. Requisitos

- **Node.js 18 ou superior** (testado com Node 22+)
- **npm** (vem junto com o Node)
- Banco de dados: **SQLite** — não precisa instalar nada; o banco é apenas um arquivo
  (`database.sqlite`) criado automaticamente.

---

## 2. Como configurar e executar (passo a passo)

```bash
# 1) Clonar o repositório
git clone https://github.com/auyber/raizes-do-nordeste-backend.git

# 2) Entrar na pasta do projeto
cd raizes-do-nordeste-backend

# 3) Instalar as dependências
npm install

# 4) Criar o arquivo de variáveis de ambiente a partir do exemplo
#    Windows:
copy .env.example .env
#    Linux/Mac:
cp .env.example .env

# 5) Criar as tabelas (migrations) e popular dados de teste (seed)
npm run setup

# 6) Iniciar a API
npm start
#   ou, em modo desenvolvimento (reinicia ao salvar):
npm run dev
```

A API sobe em **http://localhost:3000**.

Para **recriar o banco do zero** a qualquer momento:

```bash
npm run db:reset
```

---

## 3. Documentação da API (Swagger / OpenAPI)

Com a API rodando, acesse no navegador:

- **Swagger UI:** http://localhost:3000/api/docs
- **OpenAPI (JSON):** http://localhost:3000/api/docs.json

O Swagger reflete os endpoints reais, com exemplos de request/response e códigos de status.
No botão **Authorize** (cadeado), cole o token obtido no login para testar as rotas protegidas.

---

## 4. Usuários de teste (criados pelo seed)

Senha de todos: **`Senha@123`**

| Perfil   | E-mail                | Pode fazer                                            |
|----------|-----------------------|-------------------------------------------------------|
| ADMIN    | admin@raizes.com      | tudo                                                  |
| GERENTE  | gerente@raizes.com    | produtos, unidades, estoque, status de pedido         |
| CLIENTE  | cliente@raizes.com    | criar/pagar/consultar os próprios pedidos, fidelidade |

---

## 5. Como rodar os testes (coleção Postman)

A coleção está em **`postman/Raizes_do_Nordeste.postman_collection.json`**.

1. Abra o Postman → **Import** → selecione o arquivo da coleção.
2. Garanta que a API está rodando (`npm start`) e que o seed foi aplicado (`npm run setup`).
3. Recomendado: rode `npm run db:reset` antes, para os IDs ficarem previsíveis.
4. Rode as requisições **na ordem** (ou use o **Collection Runner**). Tokens e IDs são salvos
   automaticamente em variáveis da coleção.

São **15 cenários** (positivos e negativos), cobrindo: autenticação/autorização (401/403),
validação (400/422), regra de estoque (409), recurso inexistente (404) e pagamento mock
**aprovado e recusado**.

---

## 6. Principais endpoints

| Método + Rota                          | Auth / Perfil                       |
|----------------------------------------|-------------------------------------|
| `POST /api/auth/register`              | público                             |
| `POST /api/auth/login`                 | público                             |
| `GET /api/auth/me`                     | JWT                                 |
| `GET /api/unidades`                    | JWT                                 |
| `GET /api/unidades/{id}/cardapio`      | JWT                                 |
| `POST /api/unidades`                   | ADMIN, GERENTE                      |
| `GET /api/produtos?page=1&limit=10`    | JWT                                 |
| `POST /api/produtos`                   | ADMIN, GERENTE                      |
| `PUT /api/produtos/{id}`               | ADMIN, GERENTE                      |
| `DELETE /api/produtos/{id}`            | ADMIN, GERENTE                      |
| `GET /api/estoque?unidadeId=1`         | JWT                                 |
| `POST /api/estoque/movimentacoes`      | ADMIN, GERENTE, ATENDENTE           |
| `POST /api/pedidos`                    | CLIENTE                             |
| `GET /api/pedidos?canalPedido=TOTEM`   | JWT (cliente vê só os seus)         |
| `GET /api/pedidos/{id}`                | JWT                                 |
| `PATCH /api/pedidos/{id}/status`       | ADMIN, GERENTE, ATENDENTE, COZINHA  |
| `POST /api/pedidos/{id}/cancelar`      | JWT (dono ou equipe)                |
| `POST /api/pagamentos`                 | JWT                                 |
| `GET /api/fidelidade/saldo`            | CLIENTE                             |
| `POST /api/fidelidade/resgatar`        | CLIENTE                             |

### Exemplo — criar pedido (com `canalPedido`)

```json
POST /api/pedidos
{
  "unidadeId": 1,
  "canalPedido": "TOTEM",
  "formaPagamento": "MOCK",
  "itens": [
    { "produtoId": 1, "quantidade": 2 }
  ]
}
```

### Padrão de erro (igual para todas as falhas)

```json
{
  "error": "ESTOQUE_INSUFICIENTE",
  "message": "Não há quantidade suficiente para um ou mais itens.",
  "details": [ { "field": "itens[0].quantidade", "issue": "Disponível: 1" } ],
  "timestamp": "2026-02-05T12:00:00Z",
  "path": "/api/pedidos",
  "requestId": "uuid"
}
```

| Código | Quando acontece                                  |
|--------|--------------------------------------------------|
| 200    | OK                                               |
| 201    | Criado                                           |
| 204    | Sucesso sem conteúdo (ex.: desativar produto)    |
| 401    | Sem token / token inválido                       |
| 403    | Perfil sem permissão                             |
| 404    | Recurso não encontrado                           |
| 409    | Conflito / regra de negócio (estoque, transição) |
| 400/422| Erro de validação                                |

---

## 7. Arquitetura (organização em camadas)

```
src/
├── api/                 # Interface: rotas, controllers, middlewares, Swagger
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/     # auth (JWT), autorizar (roles), errorHandler, requestId
│   ├── docs/            # documento OpenAPI (openapi.js)
│   ├── helpers/         # asyncHandler
│   ├── app.js
│   └── server.js
├── application/         # Casos de uso (serviços): authService, pedidoService, ...
├── domain/              # Regras de domínio (transições de status, cálculo de pontos)
├── infrastructure/      # Banco (models/migrations/seeders), segurança, pagamento mock, logs
│   ├── database/
│   ├── security/        # hash de senha (bcrypt) + JWT
│   ├── payment/         # paymentMock.js
│   └── logger/          # auditoria
├── shared/              # utilitários (AppError, validação)
└── config/              # configuração do banco
```

Fluxo de uma requisição: **rota → middleware (auth/autorização) → controller → serviço
(application) → domínio/infraestrutura**.

---

## 8. Diagramas

Disponíveis na pasta `docs/diagramas/`:

- **Casos de Uso** — `docs/diagramas/casos_de_uso.png`
- **DER (modelo de dados)** — `docs/diagramas/der.png`
- **Diagrama de Classes** — `docs/diagramas/classes.png`
- **Sequência (fluxo crítico)** — `docs/diagramas/sequencia.png`

---

## 9. Segurança e LGPD

- **Senhas:** armazenadas apenas como **hash (bcrypt)** — nunca em texto puro.
- **Autenticação:** **JWT** (token Bearer) com expiração.
- **Autorização:** por perfil/role (`ADMIN`, `GERENTE`, `ATENDENTE`, `COZINHA`, `CLIENTE`).
- **Minimização de dados (LGPD):** coleta apenas nome e e-mail; respostas nunca expõem o hash.
- **Consentimento:** o programa de fidelidade só é ativado com consentimento do cliente.
- **Auditoria:** ações sensíveis (login, criar pedido, mudar status, pagamento, movimentação de
  estoque) são registradas na tabela `logs_auditoria`.

---

## 10. Pagamento (mock)

O pagamento é **simulado** (não há cobrança real). O serviço `paymentMock.js` devolve um retorno
parecido com o de um gateway real (status + payload), gravado na tabela `pagamentos`. Para testes
determinísticos, envie `"simular": "APROVADO"` ou `"simular": "RECUSADO"` no corpo de
`POST /api/pagamentos`.

---

## 11. Variáveis de ambiente (`.env`)

| Variável         | Descrição                       | Exemplo                  |
|------------------|---------------------------------|--------------------------|
| `PORT`           | Porta da API                    | `3000`                   |
| `NODE_ENV`       | Ambiente                        | `development`            |
| `DB_STORAGE`     | Caminho do arquivo SQLite       | `./database.sqlite`      |
| `JWT_SECRET`     | Segredo para assinar o token    | (troque por um valor seu)|
| `JWT_EXPIRES_IN` | Expiração do token              | `1h`                     |

---

## 12. Tecnologias

Node.js, Express, Sequelize (ORM) com migrations e seed, SQLite, JWT, bcryptjs, Swagger UI.
