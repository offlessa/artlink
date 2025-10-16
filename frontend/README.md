# Artlink - Frontend (starter)

Projeto frontend minimal para conectar com o backend Express que expõe os endpoints:
- POST /usuario
- POST /post
- POST /mensagem
- (outros endpoints de colaboração/curtida/comentario/catalogo já existentes no backend)

## Como usar

1. Instale dependências:
```bash
npm install
```

2. Crie um arquivo `.env` na raiz (opcional) e configure a URL da API:
```
VITE_API_URL=http://localhost:3333
```

3. Rode o projeto:
```bash
npm run dev
```

4. Abra `http://localhost:5173`

## Observações
- Este starter contém apenas formulários que usam os endpoints `POST` existentes no backend.
- Para listar recursos (GET), atualizar ou excluir, o backend precisa expor rotas GET/PUT/DELETE. Posso te ajudar a:
  - adicionar esses endpoints no backend, ou
  - implementar chamadas GET no frontend caso já existam.
