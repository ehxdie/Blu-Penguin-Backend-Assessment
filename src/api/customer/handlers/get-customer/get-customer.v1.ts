import { Request, Response } from 'express';
import { getCustomerById } from '../../services/database/customer';
import { logger } from '../../../../utils/logger';
import { BadRequestError, NotFoundError, BaseError, HttpStatusCode } from '../../../../exceptions';

/**
 * Handler to get a customer by id.
 * - using `:id` param.
 */

export const getCustomerHandler = async (req: Request, res: Response) => {
  try {
    const paramId =
      typeof req.params.id === 'string' && req.params.id.trim() !== ''
        ? req.params.id.trim()
        : undefined;
    const customerId = paramId;

    if (!customerId) {
      logger.info('No customer id provided in params.');
      throw new BadRequestError('Customer id is required');
    }

    const customer = await getCustomerById(customerId);
    if (!customer) {
      logger.info(`Customer not found with id: ${customerId}`);
      throw new NotFoundError(`Customer not found with id: ${customerId}`);
    }

    return res.status(HttpStatusCode.OK).json({
      status: 'ok',
      data: customer,
    });
  } catch (error: any) {
    logger.error('Error in getCustomerHandler:', error);

    // Error log for operational error
    if (error instanceof BaseError) {
      return res.status(error.httpCode).json({ status: 'error', message: error.message });
    }

    // Error log for internal server error
    return res
      .status(HttpStatusCode.INTERNAL_SERVER)
      .json({ status: 'error', message: 'Failed to fetch customer' });
  }
};
