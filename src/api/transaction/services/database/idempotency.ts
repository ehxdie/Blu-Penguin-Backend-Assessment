import { redisClient } from "../../../../utils/redis";
import { logger } from "../../../../utils/logger";

/**
 * Get stored idempotency value from Redis.
 * Returns parsed value or null if not found.
 */
export async function getIdempotencyValue(idempotencyKey: string): Promise<any | null> {
    try {
        const raw = await redisClient.get(idempotencyKey);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (err) {
            // if value isn't JSON, return raw
            logger.warn(`Failed to parse idempotency value for key=${idempotencyKey}, returning raw string`);
            return raw;
        }
    } catch (error) {
        logger.error(`Error reading idempotency key from redis: ${idempotencyKey}`, error);
        throw error;
    }
}

/**
 * Store idempotency value in Redis.
 * ttlSeconds defaults to 24 hours.
 */

export async function setIdempotencyValue(idempotencyKey: string, value: unknown, ttlSeconds = 60 * 60 * 24) {
    try {
        const payload = typeof value === "string" ? value : JSON.stringify(value);
        // use EX to set TTL in seconds
        await redisClient.set(idempotencyKey, payload, "EX", ttlSeconds);
    } catch (error) {
        logger.error(`Error writing idempotency key to redis: ${idempotencyKey}`, error);
        throw error;
    }
}