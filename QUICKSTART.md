# Quick Start Guide

Get the Financial Tracker API running in 5 minutes.

## Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com/get-started) installed (for database)

## Setup Steps

### 1. Install Dependencies
```bash
bun install
```

### 2. Start Database
```bash
docker-compose up -d
```

Wait a few seconds for PostgreSQL to be ready.

### 3. Run Migrations
```bash
bun run db:migrate
```

You should see:
```
Running migrations...
Migrations complete
```

### 4. Start Server
```bash
bun run dev
```

Server will start on `http://localhost:3000`

## Test the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-31T..."}
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

Save the `accessToken` from the response.

### 3. Create a Category
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Salary",
    "color": "#00FF00",
    "type": "income"
  }'
```

Save the category `id` from the response.

### 4. Create a Transaction
```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": "5000",
    "description": "Monthly salary",
    "type": "income",
    "categoryId": "YOUR_CATEGORY_ID",
    "isRecurring": true,
    "date": "2026-01-31T12:00:00.000Z"
  }'
```

### 5. Get Dashboard
```bash
curl http://localhost:3000/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

You should see your balance, monthly metrics, and the transaction you created!

## Next Steps

- Read the full [API Documentation](./README.md#api-endpoints)
- Explore the database with Drizzle Studio: `bun run db:studio`
- Run tests: `bun test`
- Check logs in the terminal

## Troubleshooting

**Database connection error?**
- Ensure Docker is running: `docker ps`
- Check PostgreSQL is healthy: `docker-compose ps`
- Restart: `docker-compose restart`

**Port 3000 already in use?**
- Change `PORT` in `.env` file
- Or stop the process using port 3000

**Migration errors?**
- Reset database: `docker-compose down -v && docker-compose up -d`
- Re-run migrations: `bun run db:migrate`

## Clean Up

Stop the database:
```bash
docker-compose down
```

Remove all data (including volumes):
```bash
docker-compose down -v
```
