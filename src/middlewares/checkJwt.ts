import { Request, Response, NextFunction } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { verify, JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../exceptions";
import { prismaClient } from "../utils/prisma";
import {
    extractTokenFromHeaders,
    verifyToken,
    AuthTokenPayload
} from "../utils/jwt";
import type { User } from "@prisma/client"; 

// CustomRequest interface to provide JWTs to controllers
export interface CustomRequest extends Request {
    token?: AuthTokenPayload;
    user?: User; // You can replace 'any' with the actual user type if you have it defined elsewhere
}

export const checkJwt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get the JWT from the request header.
        const token = extractTokenFromHeaders(req);
        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        let payload;
        try {
            payload = await verifyToken(token);
        } catch (error: any) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedError("Token expired");
            }
            throw new UnauthorizedError("Invalid token");
        }

        // Check if the token has the required properties
        if (!payload.id) {
            throw new UnauthorizedError("Malformed token");
        }

        // Fetch the user from the database
        const user = await prismaClient.user.findUnique({
            where: {
                id: payload.id as string,
            },
        });

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        // Explicitly cast req to CustomRequest and assign values
        (req as CustomRequest).user = user;
        (req as CustomRequest).token = payload;

        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to check for signup token in Authorization header
export const checkSignupToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = extractTokenFromHeaders(req);
        if (!token) {
            throw new UnauthorizedError("No signup token provided");
        }

        // Optionally verify the token (if you want to check validity)
        const payload = await verifyToken(token);
        if (!payload.id) {
            throw new UnauthorizedError("Malformed signup token");
        }

        // Fetch the user from the database using the token payload
        const user = await prismaClient.user.findUnique({
            where: {
                id: payload.id as string,
            },
        });

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        // Attach payload and user to request for downstream use
        (req as any).signupToken = payload;
        (req as any).signupUser = user;
        next();
    } catch (error) {
        next(error);
    }
};