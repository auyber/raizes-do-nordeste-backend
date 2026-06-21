'use strict';

const erroSchema = {
  type: 'object',
  properties: {
    error: { type: 'string', example: 'ERRO_DE_VALIDACAO' },
    message: { type: 'string', example: 'Um ou mais campos estao invalidos.' },
    details: {
      type: 'array',
      items: {
        type: 'object',
        properties: { field: { type: 'string' }, issue: { type: 'string' } },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
    path: { type: 'string', example: '/api/pedidos' },
    requestId: { type: 'string', example: 'uuid' },
  },
};

const respostasErro = {
  400: { description: 'Requisicao invalida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
  401: { description: 'Nao autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
  403: { description: 'Sem permissao', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
  404: { description: 'Nao encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
  409: { description: 'Conflito / regra de negocio', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
  422: { description: 'Erro de validacao', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API Raizes do Nordeste',
    version: '1.0.0',
    description:
      'API Back-end da rede de lanchonetes "Raizes do Nordeste". Projeto Multidisciplinar - Trilha Back-End. ' +
      'Fluxo critico: Pedido -> Pagamento (mock) -> Atualizacao de status. ' +
      'Usuarios de teste (senha: Senha@123): admin@raizes.com (ADMIN), gerente@raizes.com (GERENTE), cliente@raizes.com (CLIENTE).',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  tags: [
    { name: 'Auth', description: 'Autenticacao e cadastro' },
    { name: 'Unidades', description: 'Unidades da rede e cardapio' },
    { name: 'Produtos', description: 'Cardapio / produtos' },
    { name: 'Estoque', description: 'Controle de estoque por unidade' },
    { name: 'Pedidos', description: 'Fluxo de pedidos (multicanal)' },
    { name: 'Pagamentos', description: 'Pagamento simulado (mock)' },
    { name: 'Fidelidade', description: 'Programa de pontos' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Erro: erroSchema,
      LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', example: 'cliente@raizes.com' },
          senha: { type: 'string', example: 'Senha@123' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', example: 'Joao da Silva' },
          email: { type: 'string', example: 'joao@exemplo.com' },
          senha: { type: 'string', example: 'Senha@123' },
          perfil: { type: 'string', enum: ['ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE'], example: 'CLIENTE' },
          consentimentoFidelidade: { type: 'boolean', example: true },
        },
      },
      PedidoRequest: {
        type: 'object',
        required: ['unidadeId', 'canalPedido', 'itens'],
        properties: {
          unidadeId: { type: 'integer', example: 1 },
          canalPedido: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'], example: 'TOTEM' },
          formaPagamento: { type: 'string', example: 'MOCK' },
          itens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                produtoId: { type: 'integer', example: 1 },
                quantidade: { type: 'integer', example: 2 },
              },
            },
          },
        },
      },
      PagamentoRequest: {
        type: 'object',
        required: ['pedidoId'],
        properties: {
          pedidoId: { type: 'integer', example: 1 },
          simular: { type: 'string', enum: ['APROVADO', 'RECUSADO'], example: 'APROVADO' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastrar usuario',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { 201: { description: 'Usuario criado' }, ...respostasErro },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (retorna token JWT)',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: {
          200: {
            description: 'Autenticado',
            content: {
              'application/json': {
                example: {
                  accessToken: 'jwt...',
                  tokenType: 'Bearer',
                  expiresIn: '1h',
                  user: { id: 3, nome: 'Carla Cliente', email: 'cliente@raizes.com', perfil: 'CLIENTE' },
                },
              },
            },
          },
          ...respostasErro,
        },
      },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Perfil do usuario logado', responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
    '/api/unidades': {
      get: { tags: ['Unidades'], summary: 'Listar unidades', responses: { 200: { description: 'OK' }, ...respostasErro } },
      post: {
        tags: ['Unidades'],
        summary: 'Criar unidade (ADMIN/GERENTE)',
        requestBody: { required: true, content: { 'application/json': { example: { nome: 'Raizes - Fortaleza', cidade: 'Fortaleza', endereco: 'Av. Beira Mar, 10' } } } },
        responses: { 201: { description: 'Criada' }, ...respostasErro },
      },
    },
    '/api/unidades/{id}': {
      get: { tags: ['Unidades'], summary: 'Buscar unidade por id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
    '/api/unidades/{id}/cardapio': {
      get: { tags: ['Unidades'], summary: 'Cardapio da unidade', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
    '/api/produtos': {
      get: {
        tags: ['Produtos'],
        summary: 'Listar produtos (paginado)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } },
        ],
        responses: { 200: { description: 'OK' }, ...respostasErro },
      },
      post: {
        tags: ['Produtos'],
        summary: 'Criar produto (ADMIN/GERENTE)',
        requestBody: { required: true, content: { 'application/json': { example: { nome: 'Bolo de Rolo', descricao: 'Doce pernambucano', categoria: 'Doces', preco: 12.5 } } } },
        responses: { 201: { description: 'Criado' }, ...respostasErro },
      },
    },
    '/api/produtos/{id}': {
      get: { tags: ['Produtos'], summary: 'Buscar produto', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' }, ...respostasErro } },
      put: { tags: ['Produtos'], summary: 'Atualizar produto (ADMIN/GERENTE)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { example: { preco: 19.9 } } } }, responses: { 200: { description: 'OK' }, ...respostasErro } },
      delete: { tags: ['Produtos'], summary: 'Desativar produto (ADMIN/GERENTE)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Sem conteudo' }, ...respostasErro } },
    },
    '/api/estoque': {
      get: { tags: ['Estoque'], summary: 'Consultar estoque por unidade', parameters: [{ name: 'unidadeId', in: 'query', required: true, schema: { type: 'integer', example: 1 } }], responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
    '/api/estoque/movimentacoes': {
      post: {
        tags: ['Estoque'],
        summary: 'Movimentar estoque (ENTRADA/SAIDA)',
        requestBody: { required: true, content: { 'application/json': { example: { unidadeId: 1, produtoId: 1, tipo: 'ENTRADA', quantidade: 10 } } } },
        responses: { 201: { description: 'Movimentado' }, ...respostasErro },
      },
    },
    '/api/pedidos': {
      post: {
        tags: ['Pedidos'],
        summary: 'Criar pedido (CLIENTE) - exige canalPedido',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PedidoRequest' } } } },
        responses: {
          201: {
            description: 'Pedido criado',
            content: {
              'application/json': {
                example: {
                  pedidoId: 1, clienteId: 3, unidadeId: 1, canalPedido: 'TOTEM',
                  status: 'AGUARDANDO_PAGAMENTO', total: 37.0, formaPagamento: 'MOCK',
                  itens: [{ produtoId: 1, quantidade: 2, precoUnitario: 18.5, subtotal: 37.0 }],
                  pagamento: null,
                },
              },
            },
          },
          ...respostasErro,
        },
      },
      get: {
        tags: ['Pedidos'],
        summary: 'Listar pedidos (filtra por canal e status)',
        parameters: [
          { name: 'canalPedido', in: 'query', schema: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'OK' }, ...respostasErro },
      },
    },
    '/api/pedidos/{id}': {
      get: { tags: ['Pedidos'], summary: 'Consultar pedido', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
    '/api/pedidos/{id}/status': {
      patch: {
        tags: ['Pedidos'],
        summary: 'Atualizar status (equipe interna)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { example: { status: 'EM_PREPARO' } } } },
        responses: { 200: { description: 'Atualizado' }, ...respostasErro },
      },
    },
    '/api/pedidos/{id}/cancelar': {
      post: { tags: ['Pedidos'], summary: 'Cancelar pedido (devolve estoque)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Cancelado' }, ...respostasErro } },
    },
    '/api/pagamentos': {
      post: {
        tags: ['Pagamentos'],
        summary: 'Solicitar pagamento mock (APROVADO/RECUSADO)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PagamentoRequest' } } } },
        responses: {
          201: {
            description: 'Pagamento processado',
            content: {
              'application/json': {
                example: {
                  pedidoId: 1, statusPedido: 'PAGO',
                  pagamento: { id: 1, status: 'APROVADO', valor: 37.0, transacaoExternaId: 'mock_xxx', retornoGateway: { gateway: 'MOCK_PAY', aprovado: true, codigoResposta: '00' } },
                  pontosGanhos: 37,
                },
              },
            },
          },
          ...respostasErro,
        },
      },
    },
    '/api/fidelidade/saldo': {
      get: { tags: ['Fidelidade'], summary: 'Saldo de pontos do cliente', responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
    '/api/fidelidade/resgatar': {
      post: { tags: ['Fidelidade'], summary: 'Resgatar pontos', requestBody: { required: true, content: { 'application/json': { example: { pontos: 10 } } } }, responses: { 200: { description: 'OK' }, ...respostasErro } },
    },
  },
};
