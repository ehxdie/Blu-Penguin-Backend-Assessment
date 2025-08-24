import { Request, Response } from 'express';
import { createCustomer } from '../../services/database/customer';
import { logger } from '../../../../utils/logger';
import { BaseError, BadRequestError, HttpStatusCode } from '../../../../exceptions';

export const createCustomerHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, walletBalance } = req.body as {
      name: string;
      email: string;
      walletBalance: number;
    };

    // Validate required fields using exceptions
    if (!name || typeof name !== 'string') {
      throw new BadRequestError('name is required and must be a string');
    }
    if (!email || typeof email !== 'string') {
      throw new BadRequestError('email is required and must be a string');
    }

    // WalletBalance validation (expects cents as number)
    let walletBalanceCents: number | undefined = undefined;
    if (walletBalance !== undefined) {
      if (
        typeof walletBalance !== 'number' ||
        !Number.isFinite(walletBalance) ||
        walletBalance < 0
      ) {
        throw new BadRequestError('walletBalance must be a non-negative number (in cents)');
      }
      walletBalanceCents = Math.trunc(walletBalance);
    }

    const newCustomer = await createCustomer({
      name,
      email,
      walletBalance: walletBalanceCents,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Customer created successfully',
      data: newCustomer,
    });
  } catch (error: any) {
    logger.error('Error in createCustomerHandler:', error);

    // Error log for operational error
    if (error instanceof BaseError) {
      return res.status(error.httpCode).json({ status: 'error', message: error.message });
    }

    // Error log for Prisma unique constraint
    if (
      error?.code === 'P2002' ||
      (typeof error?.message === 'string' && error.message.toLowerCase().includes('unique'))
    ) {
      return res
        .status(HttpStatusCode.CONFLICT)
        .json({ status: 'error', message: 'Customer with this email already exists' });
    }

    // Error log for internal server error
    return res
      .status(HttpStatusCode.INTERNAL_SERVER)
      .json({ status: 'error', message: 'Failed to create customer' });
  }
};
