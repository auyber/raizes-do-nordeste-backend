# Plano de Testes — API Raízes do Nordeste

Evidência reproduzível: coleção **`postman/Raizes_do_Nordeste.postman_collection.json`**.
Rode na ordem (Collection Runner) com a API no ar e o seed aplicado (`npm run setup`).

Cobertura: **15 cenários** — 9 positivos e 6 negativos. Cobre autenticação/autorização (401/403),
validação (422), regra de negócio (404 e 409) e pagamento mock **aprovado e recusado**.

| ID  | Cenário | Endpoint | Pré-condição | Entrada | Esperado | Evidência (req. na coleção) |
|-----|---------|----------|--------------|---------|----------|-----------------------------|
| T01 | Login válido (cliente) | `POST /api/auth/login` | seed aplicado | email+senha válidos | **200** + `accessToken` | Auth / T01 - Login Cliente |
| T02 | Login com senha inválida | `POST /api/auth/login` | seed aplicado | senha errada | **401** + `CREDENCIAIS_INVALIDAS` | Auth / T02 - Login senha inválida |
| T03 | Listar produtos paginado | `GET /api/produtos?page=1&limit=10` | logado | query de paginação | **200** + `total` | Catalogo / T03 |
| T04 | Cardápio por unidade | `GET /api/unidades/1/cardapio` | logado | path `id=1` | **200** + lista de `itens` | Catalogo / T04 |
| T05 | Criar produto sem permissão | `POST /api/produtos` | logado como CLIENTE | body de produto | **403** + `SEM_PERMISSAO` | Catalogo / T05 |
| T06 | Criar pedido válido (TOTEM) | `POST /api/pedidos` | cliente logado | itens + `canalPedido` | **201** + status `AGUARDANDO_PAGAMENTO` | Pedidos / T06 |
| T07 | Criar pedido sem `canalPedido` | `POST /api/pedidos` | cliente logado | body sem canal | **422** (detalhe em `canalPedido`) | Pedidos / T07 |
| T08 | Criar pedido com unidade inexistente | `POST /api/pedidos` | cliente logado | `unidadeId: 9999` | **404** + `UNIDADE_NAO_ENCONTRADA` | Pedidos / T08 |
| T09 | Criar pedido com estoque insuficiente | `POST /api/pedidos` | cliente logado | unidade 2, produto 3, qtd 5 | **409** + `ESTOQUE_INSUFICIENTE` | Pedidos / T09 |
| T10 | Listar pedidos por canal | `GET /api/pedidos?canalPedido=TOTEM` | cliente logado | query `canalPedido` | **200** + todos do canal TOTEM | Pedidos / T10 |
| T11 | Acesso sem token | `GET /api/pedidos` | — | sem header Authorization | **401** + `NAO_AUTENTICADO` | Pedidos / T11 |
| T12 | Pagamento mock aprovado | `POST /api/pagamentos` | pedido criado (T06) | `simular: APROVADO` | **201** + pedido `PAGO` | Pagamento / T12 |
| T13 | Atualizar status (gerente) | `PATCH /api/pedidos/{id}/status` | pedido `PAGO`, gerente logado | `status: EM_PREPARO` | **200** + status `EM_PREPARO` | Pagamento / T13 |
| T14 | Pagamento mock recusado | `POST /api/pagamentos` | 2º pedido criado | `simular: RECUSADO` | **201** + pedido `PAGAMENTO_RECUSADO` | Pagamento / T14 |
| T15 | Consultar saldo de fidelidade | `GET /api/fidelidade/saldo` | cliente com consentimento | token cliente | **200** + `saldoPontos` | Fidelidade / T15 |

## Auditoria / Logs

Ações sensíveis geram registro na tabela `logs_auditoria` (ex.: `LOGIN`, `CRIAR_PEDIDO`,
`MUDAR_STATUS_PEDIDO`, `PROCESSAR_PAGAMENTO`, `MOVIMENTAR_ESTOQUE`). Após rodar a coleção, é possível
evidenciar consultando o banco (`database.sqlite`) na tabela `logs_auditoria` — cada criação de
pedido e mudança de status aparece como uma linha.
