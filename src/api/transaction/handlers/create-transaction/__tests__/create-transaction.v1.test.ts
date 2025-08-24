import request from 'supertest';
import express, { Express } from 'express';
import http from 'http';

// Mock dependencies
const mockCreateTransaction = jest.fn();
const mockGetIdempotencyValue = jest.fn();
const mockSetIdempotencyValue = jest.fn();

jest.mock('../../../services/database/transaction', () => ({
  createTransaction: (...args: any[]) => mockCreateTransaction(...args),
}));

jest.mock('../../../services/helpers/idempotency', () => ({
  getIdempotencyValue: (...args: any[]) => mockGetIdempotencyValue(...args),
  setIdempotencyValue: (...args: any[]) => mockSetIdempotencyValue(...args),
}));

import { createTransactionHandler } from '../create-transaction.v1';

const app: Express = express();
let server: http.Server;

app.use(express.json());
app.post('/api/transaction', createTransactionHandler);

describe('createTransactionHandler', () => {
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

  it('should create a transaction and persist idempotency', async () => {
    mockGetIdempotencyValue.mockResolvedValue(null);
    const fakeTransaction = {
      id: 'tx_1',
      customer_id: 'cust_1',
      amount: 5000,
      type: 'CREDIT',
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCreateTransaction.mockResolvedValue(fakeTransaction);
    mockSetIdempotencyValue.mockResolvedValue('OK');

    const response = await request(app)
      .post('/api/transaction')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'idem-1')
      .send({
        customerId: 'cust_1',
        amount: 5000,
        type: 'CREDIT',
        status: 'SUCCESS',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toMatchObject({ id: 'tx_1', customer_id: 'cust_1', amount: 5000 });
    expect(mockCreateTransaction).toHaveBeenCalledTimes(1);
    expect(mockSetIdempotencyValue).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for invalid amount', async () => {
    mockGetIdempotencyValue.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/transaction')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'idem-2')
      .send({
        customerId: 'cust_1',
        amount: -100,
        type: 'CREDIT',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toMatch(/amount is required/i);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
    expect(mockSetIdempotencyValue).not.toHaveBeenCalled();
  });

  it('should return stored response when idempotency key exists', async () => {
    const stored = { status: 'ok', message: 'cached', data: { id: 'tx_cached' } };
    mockGetIdempotencyValue.mockResolvedValue(stored);

    const response = await request(app)
      .post('/api/transaction')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'idem-3')
      .send({
        customerId: 'cust_1',
        amount: 2000,
        type: 'CREDIT',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(stored);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
    expect(mockSetIdempotencyValue).not.toHaveBeenCalled();
  });

  it('should return 400 if Idempotency-Key header is missing', async () => {
    const response = await request(app)
      .post('/api/transaction')
      .set('Content-Type', 'application/json')
      .send({
        customerId: 'cust_1',
        amount: 1000,
        type: 'CREDIT',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toMatch(/idempotency-key header is required/i);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
    expect(mockSetIdempotencyValue).not.toHaveBeenCalled();
  });

  it('should return 401 if customerId is missing', async () => {
    mockGetIdempotencyValue.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/transaction')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'idem-4')
      .send({
        amount: 1000,
        type: 'CREDIT',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toMatch(/customer id is required/i);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
    expect(mockSetIdempotencyValue).not.toHaveBeenCalled();
  });
});
