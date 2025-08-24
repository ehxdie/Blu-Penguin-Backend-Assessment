import { redisClient } from "../../../../utils/redis";
import { logger } from "../../../../utils/logger";

/**
 * Get stored idempotency value from Redis.
 * Returns parsed value or null if not found.
 */

export async function getIdempotencyValue(idempotencyKey: string): Promise<any | null> {
    logger.debug(`idempotency:get - attempting to read key=${idempotencyKey}`);
    try {
        const raw = await redisClient.get(idempotencyKey);
        if (!raw) {
            logger.debug(`idempotency:get - key not found: ${idempotencyKey}`);
            return null;
        }
        logger.debug(`idempotency:get - raw value length=${raw.length} for key=${idempotencyKey}`);
        try {
            const parsed = JSON.parse(raw);
            logger.info(`idempotency:get - parsed JSON for key=${idempotencyKey}`);
            return parsed;
        } catch (err) {
            // if value isn't JSON, return raw
            logger.warn(`idempotency:get - failed to parse JSON for key=${idempotencyKey}, returning raw string`);
            return raw;
        }
    } catch (error) {
        logger.error(`idempotency:get - error reading idempotency key from redis: ${idempotencyKey}`, error);
        throw error;
    }
}

/**
 * Store idempotency value in Redis.
 * ttlSeconds defaults to 24 hours.
 */

export async function setIdempotencyValue(idempotencyKey: string, value: any, ttlSeconds = 60 * 60 * 24) {
    logger.debug(`idempotency:set - attempting to store key=${idempotencyKey} ttl=${ttlSeconds}s`);
    try {
        const payload = JSON.stringify(value);
        // use EX to set TTL in seconds
        await redisClient.set(idempotencyKey, payload, "EX", ttlSeconds);
        logger.info(`idempotency:set - stored key=${idempotencyKey} payloadBytes=${Buffer.byteLength(payload, "utf8")}`);
    } catch (error) {
        logger.error(`idempotency:set - error writing idempotency key to redis: ${idempotencyKey}`, error);
        throw error;
    }
}