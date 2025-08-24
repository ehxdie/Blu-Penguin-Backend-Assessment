# Blu-Penguin Backend Assessment

A backend API for customer and transaction management, built with Node.js, Express, TypeScript, Prisma (Postgres), and Redis. The application provides endpoints for customer creation, transaction processing (with idempotency), and transaction history, with robust error handling and OpenAPI documentation.

---

## Project Overview

Blu-Penguin Backend is a modern RESTful API designed for financial operations such as customer onboarding, wallet management, and transaction processing. It features atomic wallet updates, idempotent transaction creation, and a clean, testable codebase.

---

## Features

### Customer Management
- Create new customers with wallet balance
- Fetch customer details by ID
- Fetch all transactions for a customer

### Transaction Management
- Create credit and debit transactions
- Atomic wallet and transaction updates
- Idempotency support (safe retries)


### Technical Features
- Type-safe codebase (TypeScript)
- Prisma ORM for Postgres
- Redis for idempotency and caching
- Comprehensive error handling
- OpenAPI (Swagger) documentation at `/docs`
- Docker Compose for local development
- Jest for unit and integration testing

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache/Idempotency:** Redis
- **Testing:** Jest, Supertest
- **Documentation:** Swagger (swagger-ui-express)
- **DevOps:** Docker, Docker Compose

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker & Docker Compose

### Installation

1. Clone the repository
    ```bash
    git clone https://github.com/yourusername/blu-penguin-backend-assessment.git
    cd blu-penguin-backend-assessment
    ```

2. Copy and edit the `.env` file
    ```env
    PORT=3000
    DEV_DOCKER_DATABASE=postgresql://postgres:password@db:5432/blupenguin
    DEV_DOCKER_SHADOW_DATABASE=postgresql://postgres:password@db:5432/blupenguin_shadow
    REDIS_HOST=redis
    REDIS_PORT=6379
    REDIS_PASSWORD=
    NODE_ENV=development
    ```

3. Start the stack (API, Postgres, Redis, Adminer)
    ```bash
    docker-compose up --build
    ```

4. Run database migrations (in another terminal)
    ```bash
    docker-compose exec app npx prisma migrate deploy
    ```

5. Access the API at [http://localhost:3000](http://localhost:3000)  
   Swagger docs at [http://localhost:3000/docs](http://localhost:3000/docs)  
   Adminer at [http://localhost:3001](http://localhost:3001)

---

## Environment Configuration

### Example `.env`
```
PORT=3000
DEV_DOCKER_DATABASE=postgresql://postgres:password@db:5432/blupenguin
DEV_DOCKER_SHADOW_DATABASE=postgresql://postgres:password@db:5432/blupenguin_shadow
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
NODE_ENV=development
```

---

## Running Tests

```bash
npm install
npm test
```

---

## API Documentation

The API provides the following endpoints:

### Customer Endpoints

- `POST /api/v1/customer` — Create a new customer
- `GET /api/v1/customer/:id` — Get customer by ID
- `GET /api/v1/customer/:id/transactions` — Get all transactions for a customer

### Transaction Endpoints

- `POST /api/v1/transaction` — Create a transaction (requires `Idempotency-Key` header)

**Example Create Transaction Request:**
```json
{
  "customerId": "cus_123",
  "amount": 5000,
  "type": "CREDIT",
  "status": "SUCCESS"
}
```

---

## Development

### Project Structure

```
├── src/
│   ├── api/
│   │   ├── customer/
│   │   │   ├── handlers/
│   │   │   └── services/
│   │   └── transaction/
│   │       ├── handlers/
│   │       └── services/
│   ├── exceptions/
│   ├── middlewares/
│   ├── utils/
│   ├── app.ts
│   ├── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yaml
├── Dockerfile
├── .env
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Testing

- Unit Tests (Jest)
- Integration Tests (Jest + Supertest)
- API Tests

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.


