import { Request, Response } from "express";
import { createTransaction } from "../../services/database/transaction";
import { logger } from "../../../../utils/logger";
import type { TransactionType, TransactionStatus } from "@prisma/client";

export const createTransactionHandler = async (req: Request, res: Response) => {
    try {
        // destructure all expected body params at once with types
        const {
            customerId: rawCustomerId,
            amount: rawAmount,
            type: rawType,
            status: rawStatus,
        } = req.body as {
            customerId?: string;
            amount: number;
            type: string;
            status?: string;
        };

        const customerId = typeof rawCustomerId === "string" && rawCustomerId.trim() !== "" ? rawCustomerId.trim() : undefined;

        if (!customerId) {
            logger.warn("No customer id provided");
            return res.status(401).json({ status: "error", message: "Customer id is required" });
        }

        if (rawAmount === undefined || typeof rawAmount !== "number" || !Number.isFinite(rawAmount) || rawAmount <= 0) {
            logger.warn("Invalid or missing amount");
            return res.status(400).json({ status: "error", message: "amount is required and must be a positive number (in cents)" });
        }

        const amount = Math.trunc(Math.abs(rawAmount)); // ensure integer positive cents

        const allowedTypes = ["CREDIT", "DEBIT"];

        if (!rawType || typeof rawType !== "string" || !allowedTypes.includes(rawType.toUpperCase())) {
            logger.warn("Invalid or missing transaction type");
            return res.status(400).json({ status: "error", message: "type is required and must be either 'CREDIT' or 'DEBIT'" });
        }
        
        const type = rawType.toUpperCase() as TransactionType;

        const statusCandidate = typeof rawStatus === "string" ? rawStatus.toUpperCase() : undefined;
        const status = (statusCandidate === "SUCCESS" || statusCandidate === "FAILED") ? (statusCandidate as TransactionStatus) : undefined;

        const transaction = await createTransaction({
            customerId,
            amount,
            type,
            status,
        });

        return res.status(201).json({
            status: "ok",
            message: "Transaction created successfully",
            data: transaction,
        });
    } catch (error: any) {
        logger.error("Error in createTransactionHandler:", error);
        if (error?.message?.toLowerCase()?.includes("insufficient funds")) {
            return res.status(400).json({ status: "error", message: "Insufficient funds" });
        }
        if (error?.message?.toLowerCase()?.includes("customer not found")) {
            return res.status(404).json({ status: "error", message: "Customer not found" });
        }
        return res.status(500).json({ status: "error", message: "Failed to create transaction" });
    }
};