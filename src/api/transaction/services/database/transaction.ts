// ...existing code...
import { prismaClient } from '../../../../utils/prisma';
import { logger } from '../../../../utils/logger';
import type { Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import { getCustomerWalletBalance } from '../../../customer/services/database/customer';

interface CreateTransactionInput {
  customerId: string;
  amount: number; // cents, positive magnitude
  type: TransactionType;
  status?: TransactionStatus; // optional, defaults to SUCCESS
}

/**
 * Create a new Transaction record.
 * - For DEBIT: checks wallet balance first and ensures customer has enough funds.
 * - Stores the transaction with a signed amount (negative for debit, positive for credit)
 * - Updates customer's wallet_balance atomically with the transaction
 *
 * @param data - The Transaction data
 * @returns The created Transaction record
 */

export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  const { customerId, amount, type, status = 'SUCCESS' as TransactionStatus } = data;

  try {
    logger.info(`Creating transaction for customerId=${customerId} amount=${amount} type=${type}`);

    // Ensure amount is positive magnitude
    const magnitude = Math.abs(amount);

    // For DEBIT ensure sufficient funds
    if (type === 'DEBIT') {
      const wallet = await getCustomerWalletBalance(customerId);
      if (wallet === null) {
        logger.info(`Customer not found for id=${customerId}`);
        throw new Error('Customer not found');
      }
      if (wallet < magnitude) {
        logger.info(
          `Insufficient funds for customerId=${customerId}. wallet=${wallet}, required=${magnitude}`,
        );
        throw new Error('Insufficient funds');
      }
    }

    const signedAmount = type === 'DEBIT' ? -magnitude : magnitude;

    // Atomic create transaction + update wallet balance
    const result = await prismaClient.$transaction(async (tx: any) => {
      const created = await tx.transaction.create({
        data: {
          customer_id: customerId,
          amount: signedAmount,
          type,
          status,
        },
      });

      // update wallet balance accordingly
      if (type === 'DEBIT') {
        await tx.customer.update({
          where: { id: customerId },
          data: { wallet_balance: { decrement: magnitude } },
        });
      } else {
        await tx.customer.update({
          where: { id: customerId },
          data: { wallet_balance: { increment: magnitude } },
        });
      }

      return created;
    });

    logger.info(`Created transaction id=${result.id} for customerId=${customerId}`);
    return result;
  } catch (error) {
    logger.error(`Error creating transaction for customerId=${customerId}`, error);
    throw new Error('Failed to create transaction record');
  }
}

/**
 * Fetch all transactions for a given customer id.
 * @param customerId - Customer id (cuid)
 * @returns Array of Transaction records (empty array if none)
 */

export async function getTransactionsByCustomerId(customerId: string): Promise<Transaction[]> {
  try {
    logger.info(`Fetching transactions for customerId=${customerId}`);
    const transactions = await prismaClient.transaction.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' },
    });
    logger.info(`Found ${transactions.length} transactions for customerId=${customerId}`);
    return transactions;
  } catch (error) {
    logger.error(`Error fetching transactions for customerId=${customerId}`, error);
    throw new Error('Failed to fetch transactions');
  }
}
