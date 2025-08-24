import { Request, Response } from "express";
import { getTransactionsByCustomerId } from "../../../transaction/services/database/transaction";
import { logger } from "../../../../utils/logger";
import { BadRequestError, NotFoundError, BaseError, HttpStatusCode } from "../../../../exceptions";

/**
 * Handler to fetch transactions for a customer.
 * - Uses :id route param.
*/

export const getCustomerTransactionsHandler = async (req: Request, res: Response) => {
    try {
        const paramId = typeof req.params.id === "string" && req.params.id.trim() !== "" ? req.params.id.trim() : undefined;
        const customerId = paramId;

        if (!customerId) {
            logger.warn("No customer id provided in params.");
            throw new BadRequestError("Customer id is required");
        }

        const transactions = await getTransactionsByCustomerId(customerId);

        if (!transactions || transactions.length === 0) {
            logger.info(`No transactions found for customer id=${customerId}`);
            throw new NotFoundError(`No transactions found for customer id: ${customerId}`);
        }

        return res.status(HttpStatusCode.OK).json({
            status: "ok",
            data: transactions,
        });
    } catch (error: any) {
        logger.error("Error in getCustomerTransactionsHandler:", error);

        // Error log for operational error
        if (error instanceof BaseError) {
            return res.status(error.httpCode).json({ status: "error", message: error.message });
        }

        return res.status(HttpStatusCode.INTERNAL_SERVER).json({ status: "error", message: "Failed to fetch transactions" });
    }
};