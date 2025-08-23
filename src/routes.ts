import { Router } from "express";
import type { Request, Response } from "express";
import customerRoutes from "./api/customer";
import transactionRoutes from "./api/transaction";


const router = Router();

router.get("/healthcheck", (req: Request, res: Response) => {
    res.status(200).json({ message: "ok" });
});

router.use("/:version/customers", customerRoutes);
router.use("/:version/transaction", transactionRoutes);


export default router;