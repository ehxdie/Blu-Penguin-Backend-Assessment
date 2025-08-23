import { Request, Response } from "express";
import { createCustomer } from "../../services/database/customer";
import { logger } from "../../../../utils/logger";


export const createCustomerHandler = async (req: Request, res: Response) => {
    try {
       
        const { name, email, walletBalance } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string") {
            logger.warn("Invalid or missing name");
            return res.status(400).json({ status: "error", message: "name is required and must be a string" });
        }
        if (!email || typeof email !== "string") {
            logger.warn("Invalid or missing email");
            return res.status(400).json({ status: "error", message: "email is required and must be a string" });
        }

        // Optional walletBalance validation (expects cents as number)
        let walletBalanceCents: number | undefined = undefined;
        if (walletBalance !== undefined) {
            if (typeof walletBalance !== "number" || !Number.isFinite(walletBalance) || walletBalance < 0) {
                logger.warn("Invalid walletBalance");
                return res.status(400).json({ status: "error", message: "walletBalance must be a non-negative number (in cents)" });
            }
            walletBalanceCents = Math.trunc(walletBalance);
        }

        const newCustomer = await createCustomer({
            name,
            email,
            walletBalance: walletBalanceCents,
        });

        return res.status(201).json({
            status: "ok",
            message: "Customer created successfully",
            data: newCustomer,
        });
    } catch (error: any) {
        logger.error("Error in createCustomerHandler:", error);
        // if Prisma unique constraint on email, return 409
        if (error?.message?.includes("Unique") || error?.code === "P2002") {
            return res.status(409).json({ status: "error", message: "Customer with this email already exists" });
        }
        return res.status(500).json({ status: "error", message: "Failed to create customer" });
    }
};