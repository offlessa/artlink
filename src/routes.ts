import { Router } from "express";

import { GetCatalogoController } from "./controllers/catalogo/GetCatalogoController";

import { CreateUsuarioController } from "./controllers/usuario/CreateUsuarioController";

import { CreatePostController } from "./controllers/post/CreatePostController";
import { CreatePostColaboracaoController } from "./controllers/postColaboracao/CreatePostColaboracaoController";

import { CreateCatalogoController } from "./controllers/catalogo/CreateCatalogoController";
import { CreateCatalogoColaboracaoController } from "./controllers/catalogoColaboracao/CreateCatalogoColaboracaoController";
import { CreateCatalogoPostController } from "./controllers/catalogoPost/CreateCatalogoPostController";

import { CreateCurtidaController } from "./controllers/curtida/CreateCurtidaController";

import { CreateComentarioController } from "./controllers/comentario/CreateComentarioController";

import { CreateMensagemController } from "./controllers/mensagem/CreateMensagemController";

const router = Router();

// ====== USUÁRIOS ======
router.post("/usuario", new CreateUsuarioController().handle);

// ====== POSTS ======
router.post("/post", new CreatePostController().handle);
router.post("/post/colaboracao", new CreatePostColaboracaoController().handle);
router.post("/post/curtida", new CreateCurtidaController().handle);
router.post("/post/comentario", new CreateComentarioController().handle);

// ====== CATÁLOGOS ======
router.post("/catalogo", new CreateCatalogoController().handle);
router.post(
  "/catalogo/colaboracao",
  new CreateCatalogoColaboracaoController().handle
);
router.post("/catalogo/post", new CreateCatalogoPostController().handle);

// === GETs de Catálogo ===
const getCatalogoController = new GetCatalogoController();

router.get("/catalogo", getCatalogoController.getAll);
router.get("/catalogo/:id", getCatalogoController.getById);
router.get("/catalogo/usuario/:usuarioId", getCatalogoController.getByUsuario);

// ====== MENSAGENS ======
router.post("/mensagem", new CreateMensagemController().handle);

export { router };
