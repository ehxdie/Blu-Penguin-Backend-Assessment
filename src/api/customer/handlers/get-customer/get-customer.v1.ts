import { Request, Response } from "express";
import { getCustomerById } from "../../services/database/customer";
import { logger } from "../../../../utils/logger";


/**
 * Handler to get a customer by id.
 * - If `:id` param is provided it will be used.
 * - Otherwise falls back to authenticated user's id.
 */

export const getCustomerHandler = async (req: Request, res: Response) => {
    try {
        
        const paramId = typeof req.params.id === "string" && req.params.id.trim() !== "" ? req.params.id.trim() : undefined;
        const customerId = paramId;

        if (!customerId) {
            logger.info("No customer id provided in params.");
            return res.status(400).json({ status: "error", message: "Customer id is required" });
        }

        const customer = await getCustomerById(customerId);
        if (!customer) {
            logger.info(`Customer not found with id: ${customerId}`);
            return res.status(404).json({ status: "error", message: "Customer not found" });
        }

        return res.status(200).json({
            status: "ok",
            data: customer,
        });
    } catch (error) {
        logger.error("Error in getCustomerHandler:", error);
        return res.status(500).json({ status: "error", message: "Failed to fetch customer" });
    }
};