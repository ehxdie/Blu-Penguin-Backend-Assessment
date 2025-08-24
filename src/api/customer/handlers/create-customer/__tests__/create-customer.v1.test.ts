import request from 'supertest';
import express, { Express } from 'express';
import http from 'http';

// Mock dependencies
const mockCreateCustomer = jest.fn();

jest.mock(
    '../../../services/database/customer',
    () => ({
        createCustomer: (...args: any[]) => mockCreateCustomer(...args),
    })
);

import { createCustomerHandler } from '../create-customer.v1';

const app: Express = express();
let server: http.Server;

app.use(express.json());
app.post('/api/customer', createCustomerHandler);

describe('createCustomerHandler', () => {
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

    it('should create a customer successfully', async () => {
        const fakeCustomer = {
            id: 'cust_1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            wallet_balance: 10000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockCreateCustomer.mockResolvedValue(fakeCustomer);

        const response = await request(app)
            .post('/api/customer')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Jane Doe',
                email: 'jane@example.com',
                walletBalance: 10000,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toMatchObject({
            id: 'cust_1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            wallet_balance: 10000,
        });
        expect(mockCreateCustomer).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing name', async () => {
        const response = await request(app)
            .post('/api/customer')
            .set('Content-Type', 'application/json')
            .send({
                email: 'jane@example.com',
                walletBalance: 10000,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body.message).toMatch(/name is required/i);
        expect(mockCreateCustomer).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
        const response = await request(app)
            .post('/api/customer')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Jane Doe',
                walletBalance: 10000,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body.message).toMatch(/email is required/i);
        expect(mockCreateCustomer).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid walletBalance', async () => {
        const response = await request(app)
            .post('/api/customer')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Jane Doe',
                email: 'jane@example.com',
                walletBalance: -100,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body.message).toMatch(/walletBalance must be a non-negative number/i);
        expect(mockCreateCustomer).not.toHaveBeenCalled();
    });

    it('should return 409 for duplicate email', async () => {
        mockCreateCustomer.mockImplementation(() => {
            const err: any = new Error('Unique constraint failed');
            err.code = 'P2002';
            throw err;
        });

        const response = await request(app)
            .post('/api/customer')
            .set('Content-Type', 'application/json')
            .send({
                name: 'Jane Doe',
                email: 'jane@example.com',
                walletBalance: 10000,
            });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body.message).toMatch(/already exists/i);
    });
});