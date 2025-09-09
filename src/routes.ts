import { Request, Response, Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  throw new Error("This is a test error");
});

export { router };
