import request from 'supertest';
import express, { Express } from 'express';
import http from 'http';

// Mock the getCustomerById service
const mockGetCustomerById = jest.fn();


jest.mock('../../../services/database/customer', () => ({
    getCustomerById: (...args: any[]) => mockGetCustomerById(...args),
}));

import { getCustomerHandler } from '../get-customer.v1';

const app: Express = express();
let server: http.Server;

// Route setup for testing
app.use(express.json());
app.get('/api/customer/:id', getCustomerHandler);

describe('getCustomerHandler', () => {
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

    it('should return customer data for a valid id', async () => {
        const fakeCustomer = {
            id: 'cust_1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            wallet_balance: 10000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockGetCustomerById.mockResolvedValue(fakeCustomer);

        const response = await request(app)
            .get('/api/customer/cust_1')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toMatchObject({
            id: 'cust_1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            wallet_balance: 10000,
        });
        expect(mockGetCustomerById).toHaveBeenCalledWith('cust_1');
    });

    it('should return 400 if id param is empty or whitespace', async () => {
        // This request will NOT match the route, so expect 404
        const response = await request(app)
            .get('/api/customer/') // No id param
            .set('Content-Type', 'application/json');
        expect(response.status).toBe(404);

        // This request matches the route with a whitespace id, so expect 400
        const response2 = await request(app)
            .get('/api/customer/%20')
            .set('Content-Type', 'application/json');
        expect(response2.status).toBe(400);
        expect(response2.body).toHaveProperty('status', 'error');
        expect(response2.body.message).toMatch(/customer id is required/i);
        expect(mockGetCustomerById).not.toHaveBeenCalled();
    });

    it('should return 404 if customer not found', async () => {
        mockGetCustomerById.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/customer/unknown_id')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body.message).toMatch(/not found/i);
        expect(mockGetCustomerById).toHaveBeenCalledWith('unknown_id');
    });

    it('should return 500 for unexpected errors', async () => {
        mockGetCustomerById.mockImplementation(() => {
            throw new Error('Unexpected DB error');
        });

        const response = await request(app)
            .get('/api/customer/cust_1')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body.message).toMatch(/failed to fetch customer/i);
    });
});