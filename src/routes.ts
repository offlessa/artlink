// src/routes.ts
import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "./middleware/authMiddleware";
import { UploadController } from "./controllers/upload/UploadController";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ====== AUTH ======
import { LoginController } from "./controllers/auth/LoginController";
import { EsqueciSenhaController } from "./controllers/auth/EsqueciSenhaController";
import { RedefinirSenhaController } from "./controllers/auth/RedefinirSenhaController";

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

// === CATÁLOGO IMAGEM ===
import { CreateCatalogoImagemController } from "./controllers/catalogoImagem/CreateCatalogoImagemController";
import { GetCatalogoImagemController } from "./controllers/catalogoImagem/GetCatalogoImagemController";
import { DeleteCatalogoImagemController } from "./controllers/catalogoImagem/DeleteCatalogoImagemController";

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
// ====================== UPLOAD =====================
// ===================================================
router.post("/upload", authMiddleware, upload.single("file"), new UploadController().handle);

// ===================================================
// ======================= AUTH ======================
// ===================================================
router.post("/auth/login", new LoginController().handle);
router.post("/auth/esqueci-senha", new EsqueciSenhaController().handle);
router.post("/auth/redefinir-senha", new RedefinirSenhaController().handle);

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
router.put("/usuario/:id", authMiddleware, new UpdateUsuarioController().handle);
router.delete("/usuario/:id", authMiddleware, new DeleteUsuarioController().handle);

// ===================================================
// ======================= POST ======================
// ===================================================
router.post("/post", authMiddleware, new CreatePostController().handle);
router.get("/post", new GetPostController().getAll);
router.get("/post/:id", new GetPostController().getById);
router.get("/post/usuario/:usuarioId", new GetPostController().getByUsuario);
router.put("/post/:id", authMiddleware, new UpdatePostController().handle);
router.delete("/post/:id", authMiddleware, new DeletePostController().handle);

// ===================================================
// ================ POST COLABORAÇÃO =================
// ===================================================
router.post("/post/colaboracao", authMiddleware, new CreatePostColaboracaoController().handle);
router.get(
  "/post/colaboracao/:postId",
  new GetPostColaboracaoController().getByPost
);
router.put(
  "/post/colaboracao/:postId/:usuarioId",
  authMiddleware,
  new UpdatePostColaboracaoController().handle
);
router.delete(
  "/post/colaboracao/:postId/:usuarioId",
  authMiddleware,
  new DeletePostColaboracaoController().handle
);

// ===================================================
// ===================== CATÁLOGO ====================
// ===================================================
router.post("/catalogo", authMiddleware, new CreateCatalogoController().handle);
router.get("/catalogo", new GetCatalogoController().getAll);
router.get(
  "/catalogo/usuario/:usuarioId",
  new GetCatalogoController().getByUsuario
);
router.get("/catalogo/:id", new GetCatalogoController().getById);
router.put("/catalogo/:id", authMiddleware, new UpdateCatalogoController().handle);
router.delete("/catalogo/:id", authMiddleware, new DeleteCatalogoController().handle);

// ===================================================
// ============ CATÁLOGO COLABORAÇÃO =================
// ===================================================
router.post(
  "/catalogo/colaboracao",
  authMiddleware,
  new CreateCatalogoColaboracaoController().handle
);
router.put(
  "/catalogo/colaboracao/:catalogoId/:usuarioId",
  authMiddleware,
  new UpdateCatalogoColaboracaoController().handle
);
router.delete(
  "/catalogo/colaboracao/:catalogoId/:usuarioId",
  authMiddleware,
  new DeleteCatalogoColaboracaoController().handle
);

// ===================================================
// ================== CATÁLOGO POST ==================
// ===================================================
router.post("/catalogo/post", authMiddleware, new CreateCatalogoPostController().handle);
router.get(
  "/catalogo/post/:catalogoId",
  new GetCatalogoPostController().getByCatalogo
);
router.put(
  "/catalogo/post/:catalogoId",
  authMiddleware,
  new UpdateCatalogoPostController().handle
);
router.delete(
  "/catalogo/post/:catalogoId/:postId",
  authMiddleware,
  new DeleteCatalogoPostController().handle
);

// ===================================================
// ================== CATÁLOGO IMAGEM ================
// ===================================================
router.post("/catalogo/imagem", authMiddleware, new CreateCatalogoImagemController().handle);
router.get("/catalogo/imagem/:catalogoId", new GetCatalogoImagemController().handle);
router.delete("/catalogo/imagem/:id", authMiddleware, new DeleteCatalogoImagemController().handle);

// ===================================================
// ==================== COMENTÁRIOS ==================
// ===================================================
router.post("/comentario", authMiddleware, new CreateComentarioController().handle);
router.get("/comentario/:postId", new GetComentarioController().getByPost);
router.put("/comentario/:id", authMiddleware, new UpdateComentarioController().handle);
router.delete("/comentario/:id", authMiddleware, new DeleteComentarioController().handle);

// ===================================================
// ===================== CURTIDAS ====================
// ===================================================
router.post("/curtida", authMiddleware, new CreateCurtidaController().handle);
router.get("/curtida/:postId", new GetCurtidaController().getByPost);
router.put("/curtida/:id", authMiddleware, new UpdateCurtidaController().handle);
router.delete("/curtida/:id", authMiddleware, new DeleteCurtidaController().handle);

// ===================================================
// ==================== MENSAGENS ====================
// ===================================================
router.post("/mensagem", authMiddleware, new CreateMensagemController().handle);
const getMensagemController = new GetMensagemController();

// Mensagens recebidas
router.get(
  "/mensagem/destinatario/:destinatarioId",
  authMiddleware,
  getMensagemController.getByDestinatario.bind(getMensagemController)
);

// Mensagens enviadas
router.get(
  "/mensagem/remetente/:remetenteId",
  authMiddleware,
  getMensagemController.getByRemetente.bind(getMensagemController)
);
router.put("/mensagem/:id", authMiddleware, new UpdateMensagemController().handle);
router.delete("/mensagem/:id", authMiddleware, new DeleteMensagemController().handle);

export { router };
