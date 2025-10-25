// src/routes.ts
import { Router } from "express";

// ====== IMPORTS DE CONTROLLERS ======

// === USUÁRIO ===
import { CreateUsuarioController } from "./controllers/usuario/CreateUsuarioController";
import { GetUsuarioController } from "./controllers/usuario/GetUsuarioController";
import { UpdateUsuarioController } from "./controllers/usuario/UpdateUsuarioController";
import { DeleteUsuarioController } from "./controllers/usuario/DeleteUsuarioController";

// === POST ===
import { CreatePostController } from "./controllers/post/CreatePostController";
import { GetPostController } from "./controllers/post/GetPostController";
import { UpdatePostController } from "./controllers/post/UpdatePostController";
import { DeletePostController } from "./controllers/post/DeletePostController";

// === POST COLABORAÇÃO ===
import { CreatePostColaboracaoController } from "./controllers/postColaboracao/CreatePostColaboracaoController";
import { GetPostColaboracaoController } from "./controllers/postColaboracao/GetPostColaboracaoController";
import { UpdatePostColaboracaoController } from "./controllers/postColaboracao/UpdatePostColaboracaoController";
import { DeletePostColaboracaoController } from "./controllers/postColaboracao/DeletePostColaboracaoController";

// === CATÁLOGO ===
import { CreateCatalogoController } from "./controllers/catalogo/CreateCatalogoController";
import { GetCatalogoController } from "./controllers/catalogo/GetCatalogoController";
import { UpdateCatalogoController } from "./controllers/catalogo/UpdateCatalogoController";
import { DeleteCatalogoController } from "./controllers/catalogo/DeleteCatalogoController";

// === CATÁLOGO COLABORAÇÃO ===
import { CreateCatalogoColaboracaoController } from "./controllers/catalogoColaboracao/CreateCatalogoColaboracaoController";
import { UpdateCatalogoColaboracaoController } from "./controllers/catalogoColaboracao/UpdateCatalogoColaboracaoController";
import { DeleteCatalogoColaboracaoController } from "./controllers/catalogoColaboracao/DeleteCatalogoColaboracaoController";

// === CATÁLOGO POST ===
import { CreateCatalogoPostController } from "./controllers/catalogoPost/CreateCatalogoPostController";
import { GetCatalogoPostController } from "./controllers/catalogoPost/GetCatalogoPostController";
import { UpdateCatalogoPostController } from "./controllers/catalogoPost/UpdateCatalogoPostController";
import { DeleteCatalogoPostController } from "./controllers/catalogoPost/DeleteCatalogoPostController";

// === COMENTÁRIO ===
import { CreateComentarioController } from "./controllers/comentario/CreateComentarioController";
import { GetComentarioController } from "./controllers/comentario/GetComentarioController";
import { UpdateComentarioController } from "./controllers/comentario/UpdateComentarioController";
import { DeleteComentarioController } from "./controllers/comentario/DeleteComentarioController";

// === CURTIDA ===
import { CreateCurtidaController } from "./controllers/curtida/CreateCurtidaController";
import { GetCurtidaController } from "./controllers/curtida/GetCurtidaController";
import { UpdateCurtidaController } from "./controllers/curtida/UpdateCurtidaController";
import { DeleteCurtidaController } from "./controllers/curtida/DeleteCurtidaController";

// === MENSAGEM ===
import { CreateMensagemController } from "./controllers/mensagem/CreateMensagemController";
import { GetMensagemController } from "./controllers/mensagem/GetMensagemController";
import { UpdateMensagemController } from "./controllers/mensagem/UpdateMensagemController";
import { DeleteMensagemController } from "./controllers/mensagem/DeleteMensagemController";

const router = Router();

// ===================================================
// ===================== USUÁRIO =====================
// ===================================================
router.post("/usuario", new CreateUsuarioController().handle);
router.get("/usuario", new GetUsuarioController().getAll);
router.get("/usuario/:id", new GetUsuarioController().getById);
router.get(
  "/usuario/username/:username",
  new GetUsuarioController().getByUsername
);
router.put("/usuario/:id", new UpdateUsuarioController().handle);
router.delete("/usuario/:id", new DeleteUsuarioController().handle);

// ===================================================
// ======================= POST ======================
// ===================================================
router.post("/post", new CreatePostController().handle);
router.get("/post", new GetPostController().getAll);
router.get("/post/:id", new GetPostController().getById);
router.get("/post/usuario/:usuarioId", new GetPostController().getByUsuario);
router.put("/post/:id", new UpdatePostController().handle);
router.delete("/post/:id", new DeletePostController().handle);

// ===================================================
// ================ POST COLABORAÇÃO =================
// ===================================================
router.post("/post/colaboracao", new CreatePostColaboracaoController().handle);
router.get(
  "/post/colaboracao/:postId",
  new GetPostColaboracaoController().getByPost
);
router.put(
  "/post/colaboracao/:postId/:usuarioId",
  new UpdatePostColaboracaoController().handle
);
router.delete(
  "/post/colaboracao/:postId/:usuarioId",
  new DeletePostColaboracaoController().handle
);

// ===================================================
// ===================== CATÁLOGO ====================
// ===================================================
router.post("/catalogo", new CreateCatalogoController().handle);
router.get("/catalogo", new GetCatalogoController().getAll);
router.get("/catalogo/:id", new GetCatalogoController().getById);
router.get(
  "/catalogo/usuario/:usuarioId",
  new GetCatalogoController().getByUsuario
);
router.put("/catalogo/:id", new UpdateCatalogoController().handle);
router.delete("/catalogo/:id", new DeleteCatalogoController().handle);

// ===================================================
// ============ CATÁLOGO COLABORAÇÃO =================
// ===================================================
router.post(
  "/catalogo/colaboracao",
  new CreateCatalogoColaboracaoController().handle
);
router.put(
  "/catalogo/colaboracao/:catalogoId/:usuarioId",
  new UpdateCatalogoColaboracaoController().handle
);
router.delete(
  "/catalogo/colaboracao/:catalogoId/:usuarioId",
  new DeleteCatalogoColaboracaoController().handle
);

// ===================================================
// ================== CATÁLOGO POST ==================
// ===================================================
router.post("/catalogo/post", new CreateCatalogoPostController().handle);
router.get(
  "/catalogo/post/:catalogoId",
  new GetCatalogoPostController().getByCatalogo
);
router.put(
  "/catalogo/post/:catalogoId",
  new UpdateCatalogoPostController().handle
);
router.delete(
  "/catalogo/post/:catalogoId/:postId",
  new DeleteCatalogoPostController().handle
);

// ===================================================
// ==================== COMENTÁRIOS ==================
// ===================================================
router.post("/comentario", new CreateComentarioController().handle);
router.get("/comentario/:postId", new GetComentarioController().getByPost);
router.put("/comentario/:id", new UpdateComentarioController().handle);
router.delete("/comentario/:id", new DeleteComentarioController().handle);

// ===================================================
// ===================== CURTIDAS ====================
// ===================================================
router.post("/curtida", new CreateCurtidaController().handle);
router.get("/curtida/:postId", new GetCurtidaController().getByPost);
router.put("/curtida/:id", new UpdateCurtidaController().handle);
router.delete("/curtida/:id", new DeleteCurtidaController().handle);

// ===================================================
// ==================== MENSAGENS ====================
// ===================================================
router.post("/mensagem", new CreateMensagemController().handle);
const getMensagemController = new GetMensagemController();

// Mensagens recebidas
router.get(
  "/mensagem/destinatario/:destinatarioId",
  getMensagemController.getByDestinatario.bind(getMensagemController)
);

// Mensagens enviadas
router.get(
  "/mensagem/remetente/:remetenteId",
  getMensagemController.getByRemetente.bind(getMensagemController)
);
router.put("/mensagem/:id", new UpdateMensagemController().handle);
router.delete("/mensagem/:id", new DeleteMensagemController().handle);

export { router };
