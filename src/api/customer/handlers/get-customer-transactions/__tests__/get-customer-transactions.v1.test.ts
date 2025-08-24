import request from 'supertest';
import express, { Express } from 'express';
import http from 'http';

// Mock the getTransactionsByCustomerId service
const mockGetTransactionsByCustomerId = jest.fn();

jest.mock('../../../../transaction/services/database/transaction', () => ({
  getTransactionsByCustomerId: (...args: any[]) => mockGetTransactionsByCustomerId(...args),
}));

import { getCustomerTransactionsHandler } from '../get-customer-transactions.v1';

const app: Express = express();
let server: http.Server;

// Route setup for testing
app.use(express.json());
app.get('/api/customer/:id/transactions', getCustomerTransactionsHandler);

describe('getCustomerTransactionsHandler', () => {
  beforeAll((done) => {
    server = app.listen(0, () => done());
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return transactions for a valid customer id', async () => {
    const fakeTransactions = [
      {
        id: 'tx_1',
        customer_id: 'cust_1',
        amount: 5000,
        type: 'CREDIT',
        status: 'SUCCESS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'tx_2',
        customer_id: 'cust_1',
        amount: -2000,
        type: 'DEBIT',
        status: 'SUCCESS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    mockGetTransactionsByCustomerId.mockResolvedValue(fakeTransactions);

    const response = await request(app)
      .get('/api/customer/cust_1/transactions')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(mockGetTransactionsByCustomerId).toHaveBeenCalledWith('cust_1');
  });

  it('should return 400 if id param is missing or empty', async () => {
    const response = await request(app)
      .get('/api/customer//transactions') // No id param
      .set('Content-Type', 'application/json');

    // Express will not match the route without :id, so simulate with empty id
    const response2 = await request(app)
      .get('/api/customer/ /transactions')
      .set('Content-Type', 'application/json');

    expect([404, 400]).toContain(response.status); // 404 if route not matched, 400 if handler runs
    expect(response2.status).toBe(400);
    expect(response2.body).toHaveProperty('status', 'error');
    expect(response2.body.message).toMatch(/customer id is required/i);
    expect(mockGetTransactionsByCustomerId).not.toHaveBeenCalled();
  });

  it('should return 404 if no transactions found', async () => {
    mockGetTransactionsByCustomerId.mockResolvedValue([]);

    const response = await request(app)
      .get('/api/customer/cust_2/transactions')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toMatch(/no transactions found/i);
    expect(mockGetTransactionsByCustomerId).toHaveBeenCalledWith('cust_2');
  });

  it('should return 500 for unexpected errors', async () => {
    mockGetTransactionsByCustomerId.mockImplementation(() => {
      throw new Error('Unexpected DB error');
    });

    const response = await request(app)
      .get('/api/customer/cust_1/transactions')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toMatch(/failed to fetch transactions/i);
  });
});
