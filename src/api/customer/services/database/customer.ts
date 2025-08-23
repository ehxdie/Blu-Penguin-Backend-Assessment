// ...existing code...
import { prismaClient } from "../../../../utils/prisma";
import { logger } from "../../../../utils/logger";
import type { Customer } from "@prisma/client";

interface CreateCustomerInput {
    name: string;
    email: string;
    walletBalance?: number; // in cents
}

/**
 * Create a new Customer record.
 * @param data - The Customer data
 * @returns The created Customer record
*/

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
    try {
        logger.info(`Creating customer with email: ${data.email}, name: ${data.name}`);
        const newCustomer = await prismaClient.customer.create({
            data: {
                name: data.name,
                email: data.email,
                wallet_balance: data.walletBalance ?? 0,
            },
        });
        logger.info(`Created customer with id: ${newCustomer.id} and email: ${newCustomer.email}`);
        return newCustomer;
    } catch (error) {
        logger.error(`Error creating customer with email: ${data.email}`, error);
        throw new Error("Failed to create customer record");
    }
}

/**
 * Fetch a Customer by id.
 * @param id - Customer id (cuid)
 * @returns The Customer record or null if not found
*/

export async function getCustomerById(id: string): Promise<Customer | null> {
    try {
        logger.info(`Fetching customer by id: ${id}`);
        const customer = await prismaClient.customer.findUnique({
            where: { id },
        });
        if (!customer) {
            logger.info(`Customer not found with id: ${id}`);
            return null;
        }
        logger.info(`Found customer with id: ${id}`);
        return customer;
    } catch (error) {
        logger.error(`Error fetching customer with id: ${id}`, error);
        throw new Error("Failed to fetch customer record");
    }
}

/**
 * Fetch the wallet_balance (in cents) for a customer by id.
 * @param customerId - Customer id (cuid)
 * @returns wallet_balance (number) or null if customer not found
 */

export async function getCustomerWalletBalance(customerId: string): Promise<number | null> {
    try {
        logger.info(`Fetching wallet balance for customerId: ${customerId}`);
        const result = await prismaClient.customer.findUnique({
            where: { id: customerId },
            select: { wallet_balance: true },
        });

        if (!result) {
            logger.info(`Customer not found with id: ${customerId}`);
            return null;
        }

        logger.info(`Customer ${customerId} wallet_balance: ${result.wallet_balance}`);
        return result.wallet_balance;
    } catch (error) {
        logger.error(`Error fetching wallet balance for customerId: ${customerId}`, error);
        throw new Error("Failed to fetch customer wallet balance");
    }
}