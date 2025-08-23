import { Router } from "express";
import * as CustomerController from "./handlers";
const router = Router({ mergeParams: true });


/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     tags:
 *       - Customer
 *     summary: Create a new customer
 *     description: Create a customer record. Authenticated user required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               walletBalance:
 *                 type: number
 *                 example: 10000
 *                 description: Wallet balance in cents (optional)
 *     responses:
 *       201:
 *         description: Customer created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request (missing/invalid params)
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict (e.g. email already exists)
 *       500:
 *         description: Server error creating customer
 */
router.post("/", CustomerController.createCustomerHandler);


/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     tags:
 *       - Customer
 *     summary: Get a customer by id
 *     description: Returns a customer record by id. Authenticated user required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer id (cuid)
 *     responses:
 *       200:
 *         description: Customer returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error fetching customer
 */
router.get("/:id", CustomerController.getCustomerHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/transactions:
 *   get:
 *     tags:
 *       - Customer
 *     summary: Get transactions for a specific customer
 *     description: Returns all transactions for the specified customer id. Authenticated user required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer id (cuid)
 *     responses:
 *       200:
 *         description: Transactions returned for the customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or transactions not found
 *       500:
 *         description: Server error fetching transactions
 */

router.get("/:id/transactions", CustomerController.getCustomerTransactionsHandler);

export default router;