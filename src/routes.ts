import { Router } from "express";

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

router.post("/usuario", new CreateUsuarioController().handle);

router.post("/post", new CreatePostController().handle);
router.post("/post/colaboracao", new CreatePostColaboracaoController().handle);
router.post("/post/curtida", new CreateCurtidaController().handle);
router.post("/post/comentario", new CreateComentarioController().handle);

router.post("/catalogo", new CreateCatalogoController().handle);
router.post(
  "/catalogo/colaboracao",
  new CreateCatalogoColaboracaoController().handle
);
router.post("/catalogo/post", new CreateCatalogoPostController().handle);

router.post("/mensagem", new CreateMensagemController().handle);

export { router };
