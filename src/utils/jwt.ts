import jwt, { SignOptions } from "jsonwebtoken";
import { Request } from "express";
import crypto from "crypto";

const config = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_ISSUER: process.env.JWT_ISSUER,
    // JWT_AUDIENCE: process.env.JWT_AUDIENCE,
};

export interface AuthTokenPayload {
    id: string;
    step?: string;
}

// Generate a JWT token
export const generateToken = (
    payload: AuthTokenPayload,
    expiresIn?: string
): string => {
    const options: SignOptions = {
        expiresIn: (expiresIn || config.JWT_EXPIRES_IN) as SignOptions['expiresIn'],
        notBefore: "0", // Cannot use before now, can be configured to be deferred.
        algorithm: "HS256",
        // audience: config.JWT_AUDIENCE,
        issuer: config.JWT_ISSUER,
    };

    return jwt.sign(payload, config.JWT_SECRET || "secret", options);
};

// Verify a JWT token
export const verifyToken = (
    token: string
): Promise<AuthTokenPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            config.JWT_SECRET || "",
            {
                algorithms: ["HS256"],
                issuer: config.JWT_ISSUER,
            },
            (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded as AuthTokenPayload);
            }
        );
    });
};

// Extract JWT token from request headers
export const extractTokenFromHeaders = (req: Request): string | null => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
        const token = authorizationHeader.split(" ")[1];
        return token;
    }
    return null;
};

/**
 * Generates a password reset token and expiry timestamp.
 * Returns an object with the token, its hashed version, and the expiry date.
 */

export const createPasswordResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    return {
        resetToken,
        passwordResetExpires
    };
};
