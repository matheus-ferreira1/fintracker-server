# Financial Tracker Backend API

A complete backend API for personal finance tracking with authentication, categories, transactions, and dashboard analytics.

## Technology Stack

- **Runtime**: Bun
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT with refresh token rotation
- **Password Hashing**: Argon2 (via Bun.password)
- **Logging**: Pino

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL 14+ OR Docker & Docker Compose

## Setup

### Option 1: Using Docker (Recommended)

1. Install dependencies:
```bash
bun install
```

2. Start PostgreSQL with Docker:
```bash
docker-compose up -d
```

3. Copy `.env.example` to `.env` (default values work with Docker setup):
```bash
cp .env.example .env
```

4. Run database migrations:
```bash
bun run db:migrate
```

5. Start the development server:
```bash
bun run dev
```

### Option 2: Using Local PostgreSQL

1. Install dependencies:
```bash
bun install
```

2. Create a PostgreSQL database:
```bash
createdb fintracker
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT (min 32 characters)
- `PORT`: Server port (default: 3000)
- `ALLOWED_ORIGINS`: Comma-separated CORS origins

4. Update `DATABASE_URL` in `.env` with your PostgreSQL credentials

5. Run database migrations:
```bash
bun run db:migrate
```

6. Start the development server:
```bash
bun run dev
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run db:generate` - Generate new migration from schema changes
- `bun run db:migrate` - Apply pending migrations
- `bun run db:studio` - Open Drizzle Studio (database GUI)
- `bun run test` - Run tests

### Docker Commands

- `docker-compose up -d` - Start PostgreSQL in background
- `docker-compose down` - Stop PostgreSQL
- `docker-compose logs -f` - View PostgreSQL logs

## API Endpoints

### Health Check

#### `GET /health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T12:00:00.000Z"
}
```

---

### Authentication

All authentication endpoints are public (no token required).

#### `POST /api/v1/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Validation:**
- Email must be valid format
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Name: 2-255 characters

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### `POST /api/v1/auth/login`

Login with credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### `POST /api/v1/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Note:** Old refresh token is invalidated, new one is issued (token rotation).

---

### Categories

All category endpoints require authentication. Include header: `Authorization: Bearer <accessToken>`

#### `GET /api/v1/categories`

List all categories for authenticated user.

**Query Parameters:**
- `type` (optional): Filter by `income` or `expense`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Salary",
    "color": "#00FF00",
    "type": "income",
    "createdAt": "2026-01-31T12:00:00.000Z",
    "updatedAt": "2026-01-31T12:00:00.000Z"
  }
]
```

#### `POST /api/v1/categories`

Create a new category.

**Request Body:**
```json
{
  "name": "Groceries",
  "color": "#FF5733",
  "type": "expense"
}
```

**Validation:**
- Name: 1-100 characters, unique per user
- Color: hex format (#RRGGBB)
- Type: `income` or `expense`

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Groceries",
  "color": "#FF5733",
  "type": "expense",
  "createdAt": "2026-01-31T12:00:00.000Z",
  "updatedAt": "2026-01-31T12:00:00.000Z"
}
```

#### `GET /api/v1/categories/:id`

Get a specific category.

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Groceries",
  "color": "#FF5733",
  "type": "expense",
  "createdAt": "2026-01-31T12:00:00.000Z",
  "updatedAt": "2026-01-31T12:00:00.000Z"
}
```

#### `PATCH /api/v1/categories/:id`

Update a category.

**Request Body (all fields optional):**
```json
{
  "name": "Food & Groceries",
  "color": "#FF6347",
  "type": "expense"
}
```

**Response (200):** Updated category object

#### `DELETE /api/v1/categories/:id`

Delete a category.

**Response (204):** No content

**Note:** Cannot delete if transactions reference this category (foreign key constraint).

---

### Transactions

All transaction endpoints require authentication.

#### `GET /api/v1/transactions`

List transactions with filtering and pagination.

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page
- `search` (optional): Search in description
- `type` (optional): Filter by `income` or `expense`
- `categoryId` (optional): Filter by category
- `sort` (default: `newest`): Sort by `newest` or `oldest`

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "categoryId": "uuid",
      "amount": "5000.0000",
      "description": "Monthly salary",
      "type": "income",
      "isRecurring": true,
      "date": "2026-01-31T12:00:00.000Z",
      "createdAt": "2026-01-31T12:00:00.000Z",
      "updatedAt": "2026-01-31T12:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Salary",
        "color": "#00FF00",
        "type": "income"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### `POST /api/v1/transactions`

Create a new transaction.

**Request Body:**
```json
{
  "amount": "5000.50",
  "description": "Monthly salary",
  "type": "income",
  "categoryId": "uuid",
  "isRecurring": true,
  "date": "2026-01-31T12:00:00.000Z"
}
```

**Validation:**
- Amount: Valid decimal with up to 4 decimal places
- Description: 1-500 characters
- Type must match category type
- Date: ISO 8601 datetime string

**Response (201):** Created transaction object

#### `GET /api/v1/transactions/:id`

Get a specific transaction.

**Response (200):** Transaction object with category details

#### `PATCH /api/v1/transactions/:id`

Update a transaction.

**Request Body (all fields optional):**
```json
{
  "amount": "5100.00",
  "description": "Updated salary",
  "type": "income",
  "categoryId": "uuid",
  "isRecurring": true,
  "date": "2026-01-31T12:00:00.000Z"
}
```

**Response (200):** Updated transaction object

#### `DELETE /api/v1/transactions/:id`

Delete a transaction.

**Response (204):** No content

---

### Dashboard

Dashboard endpoint requires authentication.

#### `GET /api/v1/dashboard`

Get comprehensive dashboard data including balance, monthly metrics, charts, and breakdowns.

**Response (200):**
```json
{
  "balance": {
    "total": "12500.0000"
  },
  "monthly": {
    "income": "5000.0000",
    "expenses": "2500.0000",
    "savings": "2500.0000",
    "incomeChange": 10.5,
    "expensesChange": -5.2,
    "savingsChange": 25.3
  },
  "chart": {
    "last6Months": [
      {
        "month": "2025-08",
        "income": "4500.0000",
        "expenses": "2000.0000"
      },
      {
        "month": "2025-09",
        "income": "5000.0000",
        "expenses": "2200.0000"
      }
    ]
  },
  "breakdown": {
    "incomeByCategory": [
      {
        "categoryId": "uuid",
        "categoryName": "Salary",
        "categoryColor": "#00FF00",
        "total": "5000.0000",
        "percentage": 100.0
      }
    ],
    "expensesByCategory": [
      {
        "categoryId": "uuid",
        "categoryName": "Groceries",
        "categoryColor": "#FF5733",
        "total": "1500.0000",
        "percentage": 60.0
      },
      {
        "categoryId": "uuid",
        "categoryName": "Transport",
        "categoryColor": "#3357FF",
        "total": "1000.0000",
        "percentage": 40.0
      }
    ]
  },
  "recentTransactions": [
    {
      "id": "uuid",
      "amount": "50.0000",
      "description": "Grocery shopping",
      "type": "expense",
      "date": "2026-01-31T12:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Groceries",
        "color": "#FF5733"
      }
    }
  ]
}
```

**Dashboard Calculations:**
- **Balance**: Total income - total expenses (all time)
- **Monthly metrics**: Current month sums with % change from previous month
- **Chart**: Last 6 months of income/expenses aggregated by month
- **Breakdown**: Category totals with percentages
- **Recent transactions**: Last 10 transactions ordered by date

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Error description"
  }
}
```

**Validation Errors (400):**
```json
{
  "error": {
    "message": "Validation failed",
    "errors": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": ["body", "email"],
        "message": "Expected string, received number"
      }
    ]
  }
}
```

**Common Status Codes:**
- `400` - Validation error
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden
- `404` - Resource not found
- `409` - Conflict (duplicate resource)
- `500` - Internal server error

---

## Authentication Flow

1. **Register/Login**: Receive `accessToken` (15min expiry) and `refreshToken` (7 days)
2. **Make Requests**: Include `Authorization: Bearer <accessToken>` header
3. **Token Expired**: Use refresh endpoint with `refreshToken`
4. **Token Rotation**: Each refresh invalidates old token, issues new pair

**Security Features:**
- Passwords hashed with Argon2
- Refresh tokens stored hashed in database
- Automatic token rotation prevents token reuse
- Access tokens short-lived to limit exposure

---

## Database Schema

### Users
- Stores user accounts with hashed passwords

### Refresh Tokens
- Stores active refresh tokens with expiration
- Cascade delete on user deletion

### Categories
- User-specific income/expense categories
- Unique constraint on (userId, name)

### Transactions
- Financial transactions linked to categories
- Indexes on (userId, date), (userId, type), (userId, categoryId)
- Restrict delete on category (prevents orphaned transactions)

---

## Development

### Project Structure
```
src/
├── config/         # Environment and database config
├── db/             # Database schema and migrations
├── lib/            # Utilities (errors, logger, jwt, password)
├── middleware/     # Express middleware (auth, validation, errors)
├── auth/           # Authentication module
├── categories/     # Categories module
├── transactions/   # Transactions module
├── dashboard/      # Dashboard module
├── app.ts          # Express app setup
└── index.ts        # Server entry point
```

### Adding New Features

1. Create feature folder with:
   - `*.schema.ts` - Zod validation schemas
   - `*.repository.ts` - Database queries
   - `*.service.ts` - Business logic
   - `*.router.ts` - Route handlers
   - `*.test.ts` - Tests

2. Register router in `src/app.ts`

3. Follow patterns from existing modules

---

## License

MIT
