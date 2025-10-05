import { Router } from "express";
import { CreateUsuarioController } from "./controllers/usuario/CreateUsuarioController";
import { CreatePostController } from "./controllers/post/CreatePostController";
import { CreatePostColaboracaoController } from "./controllers/postColaboracao/CreatePostColaboracaoController";

const router = Router();

router.post("/usuario", new CreateUsuarioController().handle);

router.post("/post", new CreatePostController().handle);

router.post("/post/colaboracao", new CreatePostColaboracaoController().handle);

export { router };
