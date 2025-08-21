import { Response } from "express";
import { BaseError } from "../exceptions";
import { logger } from "../utils/logger";

class ErrorHandler {
    public async handleError(err: Error, res?: Response): Promise<void> {
        await logger.error(
            "Error message the centralized error-handling middleware: ",
            err,
        );

        if (err instanceof BaseError) {
            if (res) {
                res.status(err.httpCode).json({ status: "fail", message: err.message });
            }
        }

        // await sendMailToAdminIfCritical();
        // await sendEventsToSentry()
    }

    public isTrustedError(error: Error): boolean {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }
}

export const errorHandler = new ErrorHandler();
