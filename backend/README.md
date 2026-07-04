# ZeroPlastic Backend

Backend API foundation for the ZeroPlastic Platform.

## Stack

- Node.js 22 LTS
- TypeScript
- Express.js
- dotenv, cors, helmet, morgan
- Prisma ORM (Azure PostgreSQL)

## Getting Started

1. Copy the environment file and set `DATABASE_URL` to the Azure PostgreSQL connection string:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run in development mode:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Start the production build:

   ```bash
   npm start
   ```

## Endpoints

- `GET /` — Returns `ZeroPlastic API Running`
- `GET /health` — Returns service health status
- `GET /db-health` — Checks the database connection via Prisma

## Project Structure

```
backend/
  prisma/
    schema.prisma   # Prisma schema (datasource + generator, no models yet)
  src/
    app.ts          # Express app configuration
    server.ts       # Server entry point
    routes/         # Route definitions
    middleware/      # Custom middleware
    config/          # Configuration (env, prisma client, etc.)
```
