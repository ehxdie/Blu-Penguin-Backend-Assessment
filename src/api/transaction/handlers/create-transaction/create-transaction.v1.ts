import { Request, Response } from "express";
import { createTransaction } from "../../services/database/transaction";
import { getIdempotencyValue, setIdempotencyValue } from "../../services/database/idempotency";
import { logger } from "../../../../utils/logger";
import type { TransactionType, TransactionStatus } from "@prisma/client";
import { BadRequestError, UnauthorizedError, NotFoundError, BaseError, HttpStatusCode } from "../../../../exceptions";

export const createTransactionHandler = async (req: Request, res: Response) => {
    try {
        const idempotencyKey = req.header("Idempotency-Key");

        if (!idempotencyKey || typeof idempotencyKey !== "string" || idempotencyKey.trim() === "") {
            logger.warn("Missing Idempotency-Key header");
            throw new BadRequestError("Idempotency-Key header is required");
        }

        // return stored response if key exists (value is the actual response payload)
        const existing = await getIdempotencyValue(idempotencyKey);
        if (existing) {
            logger.info(`Idempotency key found, returning stored response for key=${idempotencyKey}`);
            return res.status(HttpStatusCode.OK).json(existing);
        }

        const {
            customerId,
            amount,
            type,
            status
        } = req.body as {
            customerId: string;
            amount: number;
            type: string;
            status: string;
        };

        // customerId validation
        if (!customerId || typeof customerId !== "string" || customerId.trim() === "") {
            logger.warn("No customer id provided in body");
            throw new UnauthorizedError("Customer id is required");
        }

        // amount validation
        if (amount === undefined || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
            logger.warn("Invalid or missing amount");
            throw new BadRequestError("amount is required and must be a positive number (in cents)");
        }
        const amountCents = Math.trunc(Math.abs(amount)); // integer cents

        // type validation
        const allowedTypes = ["CREDIT", "DEBIT"];

        if (!type || typeof type !== "string" || !allowedTypes.includes(type.toUpperCase())) {
            logger.warn("Invalid or missing transaction type");
            throw new BadRequestError("type is required and must be either 'CREDIT' or 'DEBIT'");
        }
        const txType = type.toUpperCase() as TransactionType;

        // status normalization
        const statusCandidate = typeof status === "string" ? status.toUpperCase() : undefined;
        const txStatus = (statusCandidate === "SUCCESS" || statusCandidate === "FAILED") ? (statusCandidate as TransactionStatus) : undefined;

        const transaction = await createTransaction({
            customerId,
            amount: amountCents,
            type: txType,
            status: txStatus,
        });

        const responsePayload = {
            status: "ok",
            message: "Transaction created successfully",
            data: transaction,
        };

        // persist idempotency record in redis; if it fails, log but still return the created transaction
        try {
            await setIdempotencyValue(idempotencyKey, responsePayload);
        } catch (err) {
            logger.error(`Failed to persist idempotency record in redis for key=${idempotencyKey}`, err);
        }

        return res.status(HttpStatusCode.CREATED).json(responsePayload);
    } catch (error: any) {
        logger.error("Error in createTransactionHandler:", error);

        if (error instanceof BaseError) {
            return res.status(error.httpCode).json({ status: "error", message: error.message });
        }

        const msg = String(error?.message ?? "").toLowerCase();

        if (msg.includes("insufficient funds")) {
            const e = new BadRequestError("Insufficient funds");
            return res.status(e.httpCode).json({ status: "error", message: e.message });
        }

        if (msg.includes("customer not found")) {
            const e = new NotFoundError("Customer not found");
            return res.status(e.httpCode).json({ status: "error", message: e.message });
        }

        return res.status(HttpStatusCode.INTERNAL_SERVER).json({ status: "error", message: "Failed to create transaction" });
    }
};