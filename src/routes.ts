import { Router } from "express";
import type { Request, Response } from "express";
import authenticationRoutes from "./api/authentication";
import userRoutes from "./api/user";


const router = Router();

router.get("/healthcheck", (req: Request, res: Response) => {
    res.status(200).json({ message: "ok" });
});

router.use("/:version/auth", authenticationRoutes);
router.use("/:version/user", userRoutes);


export default router;