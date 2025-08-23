import { Request, Response } from "express";
import { getTransactionsByCustomerId } from "../../../transaction/services/database/transaction";
import { logger } from "../../../../utils/logger";

/**
 * Handler to fetch transactions for a customer.
 * - Uses :id route param if provided, otherwise falls back to authenticated user's id.
*/

export const getCustomerTransactionsHandler = async (req: Request, res: Response) => {
    try {
        
        const paramId = typeof req.params.id === "string" && req.params.id.trim() !== "" ? req.params.id.trim() : undefined;
        const customerId = paramId;

        if (!customerId) {
            logger.warn("No customer id provided and user not authenticated");
            return res.status(401).json({ status: "error", message: "Customer id is required or user must be authenticated" });
        }

        const transactions = await getTransactionsByCustomerId(customerId);

        return res.status(200).json({
            status: "ok",
            data: transactions,
        });
    } catch (error) {
        logger.error("Error in getTransactionsHandler:", error);
        return res.status(500).json({ status: "error", message: "Failed to fetch transactions" });
    }
};