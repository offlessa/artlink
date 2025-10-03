import { Router } from "express";
import { CreateUsuarioController } from "./controllers/usuario/CreateUsuarioController";

const router = Router();

router.post("/usuario", new CreateUsuarioController().handle);

export { router };
