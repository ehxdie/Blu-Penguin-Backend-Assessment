import { Router } from "express";
import * as TransactionController from "./handlers";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /api/v1/transaction:
 *   post:
 *     tags:
 *       - Transaction
 *     summary: Create a new transaction
 *     description: Create a transaction (credit or debit) for a customer. Authenticated user required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "cjld2cjxh0000qzrmn831i7rn"
 *                 description: Customer id (optional; if omitted authenticated user's id is used)
 *               amount:
 *                 type: number
 *                 example: 5000
 *                 description: Amount in cents (positive number)
 *               type:
 *                 type: string
 *                 example: "CREDIT"
 *                 description: Transaction type - CREDIT or DEBIT
 *               status:
 *                 type: string
 *                 example: "SUCCESS"
 *                 description: Transaction status (optional)
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request (missing/invalid params or insufficient funds)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error creating transaction
 */
router.post("/", TransactionController.createTransactionHandler);


export default router;