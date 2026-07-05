# Zero Plastic Platform
## Technology Stack Validation & Phase 1 Setup Guide

**Version:** 1.0  
**Date:** July 2026  
**Purpose:** Confirm tech stack and provide Phase 1 implementation patterns

---

## 1. TECHNOLOGY STACK VALIDATION

### Your Stack ✅

```
BACKEND:
├─ Node.js 22 LTS         ✅ Perfect (modern, stable, LTS)
├─ Express.js             ✅ Right choice (lightweight, flexible)
├─ TypeScript             ✅ Essential (type safety, less bugs)
├─ Prisma ORM             ✅ Excellent (type-safe, migrations, excellent DX)
├─ PostgreSQL 18          ✅ Solid choice (relational, robust)
└─ Azure PostgreSQL FS    ✅ Good (Azure managed, scales well)

FRONTEND (Web):
├─ React 18+              ✅ Right choice (component-based, ecosystem)
├─ Next.js                ✅ Excellent (SSR, file-based routing, API routes)
├─ Tailwind CSS           ✅ Perfect for this (utility-first, fast)
└─ Vite (recommended)     ✅ For React SPA (faster builds)

MOBILE:
├─ Flutter 3.22+          ✅ Excellent (cross-platform, performant)
├─ Dart 3.3+              ✅ Modern language (type-safe)
├─ Riverpod               ✅ Great state management (reactive)
└─ Geolocator             ✅ Location service (reliable)

AUTHENTICATION:
├─ Twilio SMS             ✅ Perfect (global coverage, reliable)
├─ Twilio WhatsApp        ✅ Good for reminders (WhatsApp cheaper)
├─ JWT + Refresh Tokens   ✅ Standard (secure, stateless)
└─ bcrypt                 ✅ Password hashing (industry standard)

CLOUD:
├─ Azure App Service      ✅ Good for Node apps
├─ Azure PostgreSQL FS    ✅ Managed database (great)
├─ Azure Storage          ✅ File storage (certificates, images)
├─ GitHub Actions         ✅ CI/CD (integrates with GitHub)
├─ Azure Key Vault        ✅ Secrets management
└─ Azure Monitor          ✅ Logging & monitoring

INTEGRATIONS:
├─ Monday.com API         ✅ Project tracking
├─ Make.com (Zapier alt)  ✅ Workflow automation
├─ Firebase Cloud Msg     ✅ Push notifications
└─ SendGrid/Twilio Email  ✅ Transactional email
```

### Why This Stack Works for Your Modular Approach

✅ **Type Safety Everywhere** → TypeScript + Prisma = fewer bugs at module boundaries  
✅ **Clear API Contracts** → Next.js API routes + Prisma schema = well-defined interfaces  
✅ **Database Migrations** → Prisma migrations = safe incremental changes  
✅ **Hot Reload in Dev** → React/Flutter hot reload = fast iteration  
✅ **Scaling Ready** → All technologies scale (PostgreSQL, Node cluster, CDN)  
✅ **Monitoring Built-in** → Azure Monitor + Winston logging = easy debugging  

---

## 2. PHASE 1 TECHNOLOGY SETUP

### Week 1: Environment & Infrastructure

#### Git & GitHub
```bash
# Initialize monorepo structure
mkdir zero-plastic
cd zero-plastic
git init

# Branch strategy for Phase 1
git checkout -b phase-1/backend
# Work on this branch until Phase 1 validation gate passes
# Then merge to main with PR review
```

#### Azure Setup
```
1. Create Azure Resource Group
   az group create --name zero-plastic-rg --location eastus

2. Create PostgreSQL Flexible Server
   az postgres flexible-server create \
     --resource-group zero-plastic-rg \
     --name zero-plastic-db \
     --admin-user pgadmin \
     --admin-password [STRONG PASSWORD]

3. Create App Service Plan
   az appservice plan create \
     --name zero-plastic-plan \
     --resource-group zero-plastic-rg \
     --sku B2

4. Create App Service (Node.js)
   az webapp create \
     --resource-group zero-plastic-rg \
     --plan zero-plastic-plan \
     --name zero-plastic-api

5. Create Azure Storage Account (images, certificates)
   az storage account create \
     --resource-group zero-plastic-rg \
     --name zeroplasticstore

6. Create Key Vault (secrets)
   az keyvault create \
     --resource-group zero-plastic-rg \
     --name zero-plastic-kv
```

#### Local Environment
```bash
# .env.example (commit to repo)
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/zero_plastic_dev
JWT_SECRET=your-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-here-min-32-chars
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
AZURE_STORAGE_ACCOUNT=your-storage-account
AZURE_STORAGE_KEY=your-storage-key
```

#### Local PostgreSQL (Docker)
```bash
# docker-compose.yml for local development
version: '3.8'
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: pguser
      POSTGRES_PASSWORD: pgpass
      POSTGRES_DB: zero_plastic_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pguser"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

```bash
# Start local database
docker-compose up -d

# Connect with psql
psql postgresql://pguser:pgpass@localhost:5432/zero_plastic_dev
```

---

### Week 2: Backend Project Setup

#### Create Backend Project Structure
```bash
mkdir zero-plastic-backend
cd zero-plastic-backend

npm init -y
npm install \
  express \
  typescript \
  @types/express \
  @types/node \
  ts-node \
  nodemon \
  @prisma/client \
  prisma \
  bcrypt \
  jsonwebtoken \
  @types/jsonwebtoken \
  dotenv \
  cors \
  helmet \
  winston \
  joi

npm install --save-dev \
  ts-node \
  @types/jest \
  jest \
  ts-jest
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@services/*": ["src/services/*"],
      "@repositories/*": ["src/repositories/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@config/*": ["src/config/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node --files src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "ts-node src/prisma/seed.ts"
  }
}
```

#### Project Structure for Phase 1

```
zero-plastic-backend/
├── src/
│   ├── app.ts                          # Express app setup
│   ├── server.ts                       # Server startup
│   │
│   ├── models/                         # Prisma models
│   │   └── index.ts                    # Re-export all models
│   │
│   ├── services/                       # Business logic
│   │   ├── authService.ts              # M0.2
│   │   ├── userService.ts              # M0.3
│   │   ├── projectService.ts           # M0.4
│   │   ├── clubService.ts              # M0.4
│   │   └── index.ts
│   │
│   ├── repositories/                   # Data access layer
│   │   ├── userRepository.ts           # M0.3
│   │   ├── projectRepository.ts        # M0.4
│   │   ├── clubRepository.ts           # M0.4
│   │   └── index.ts
│   │
│   ├── controllers/                    # Route handlers
│   │   ├── authController.ts           # M0.2
│   │   ├── userController.ts           # M0.3
│   │   ├── projectController.ts        # M0.4
│   │   ├── clubController.ts           # M0.4
│   │   └── index.ts
│   │
│   ├── routes/                         # Express routes
│   │   ├── authRoutes.ts               # M0.5
│   │   ├── userRoutes.ts               # M0.5
│   │   ├── projectRoutes.ts            # M0.5
│   │   ├── clubRoutes.ts               # M0.5
│   │   └── index.ts
│   │
│   ├── middleware/                     # Express middleware
│   │   ├── authMiddleware.ts           # JWT verification
│   │   ├── errorHandler.ts             # Error handling
│   │   ├── requestLogger.ts            # Request logging
│   │   ├── validation.ts               # Input validation
│   │   └── corsMiddleware.ts           # CORS config
│   │
│   ├── utils/                          # Utility functions
│   │   ├── validators.ts               # Input validators (Joi)
│   │   ├── formatters.ts               # Response formatters
│   │   ├── errors.ts                   # Custom error classes
│   │   ├── logger.ts                   # Winston logger setup
│   │   ├── jwt.ts                      # JWT utilities
│   │   └── passwords.ts                # Password utilities
│   │
│   ├── config/                         # Configuration
│   │   ├── database.ts                 # Prisma client singleton
│   │   ├── auth.ts                     # Auth config (JWT secrets)
│   │   ├── twilio.ts                   # Twilio config
│   │   ├── azure.ts                    # Azure config
│   │   └── index.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # M0.1
│   │   └── seed.ts                     # Test data
│   │
│   └── tests/                          # Tests
│       ├── unit/
│       │   ├── services.test.ts
│       │   ├── validators.test.ts
│       │   └── utils.test.ts
│       ├── integration/
│       │   ├── auth.test.ts
│       │   ├── users.test.ts
│       │   ├── projects.test.ts
│       │   └── clubs.test.ts
│       └── fixtures/
│           └── testData.ts
│
├── prisma/
│   └── migrations/                     # Database migrations (auto-generated)
│
├── .env.example
├── .env.local (git ignored)
├── .gitignore
├── tsconfig.json
├── jest.config.js
├── package.json
├── README.md
└── docker-compose.yml
```

---

### Prisma Schema (M0.1)

#### Initial Schema Structure
```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ===== USERS & PROFILES =====

enum UserRole {
  VOLUNTEER
  CLUB_PRESIDENT
  CLUB_OFFICER
  DISTRICT_DIRECTOR
  PROVINCIAL_DIRECTOR
  NATIONAL_DIRECTOR
  FINANCE_MANAGER
  HR_MANAGER
  SYSTEM_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
  SUSPENDED
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  phone           String    @unique
  passwordHash    String
  role            UserRole
  status          UserStatus @default(ACTIVE)
  
  profile         Profile?
  club            Club?     @relation("clubPresident")
  clubMemberships ClubMember[]
  projects        ProjectVolunteer[]
  checkIns        CheckIn[]
  marks           Mark[]
  complaints      Complaint[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([email])
  @@index([phone])
  @@index([role])
  @@index([status])
}

model Profile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  firstName       String
  lastName        String
  profileImageUrl String?
  bio             String?
  phoneVerified   Boolean   @default(false)
  
  totalPoints     Int       @default(0)
  totalHours      Float     @default(0)
  tier            String    @default("ROOKIE")
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ===== CLUBS =====

model Club {
  id              String    @id @default(cuid())
  name            String    @unique
  description     String?
  presidentId     String    @unique
  president       User      @relation("clubPresident", fields: [presidentId], references: [id])
  
  location        String?
  city            String?
  district        String?
  province        String?
  
  members         ClubMember[]
  projects        Project[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([presidentId])
  @@index([district])
}

model ClubMember {
  id              String    @id @default(cuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role            String    @default("MEMBER")  // MEMBER, OFFICER, LEADER
  joinedAt        DateTime  @default(now())
  
  @@unique([clubId, userId])
  @@index([clubId])
  @@index([userId])
}

// ===== PROJECTS =====

enum ProjectStatus {
  DRAFT
  SUBMITTED
  APPROVED
  ACTIVE
  COMPLETED
  REJECTED
}

model Project {
  id              String    @id @default(cuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  name            String
  description     String?
  status          ProjectStatus @default(DRAFT)
  
  startDate       DateTime
  endDate         DateTime
  location        String
  latitude        Float?
  longitude       Float?
  
  volunteersNeeded Int
  volunteers      ProjectVolunteer[]
  
  budget          Float?
  impactMetrics   String?  // JSON: plastic collected, etc
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([clubId])
  @@index([status])
  @@index([startDate])
}

// ===== PARTICIPATION =====

model ProjectVolunteer {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status          String    @default("ACCEPTED")  // INVITED, ACCEPTED, DECLINED, ATTENDED
  hoursWorked     Float     @default(0)
  
  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

// ===== CHECK-IN/OUT =====

model CheckIn {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId       String
  
  checkInTime     DateTime
  checkOutTime    DateTime?
  latitude        Float
  longitude       Float
  accuracy        Float?
  
  pointsEarned    Int       @default(0)
  
  @@index([userId])
  @@index([projectId])
  @@index([checkInTime])
}

// ===== MARKS & POINTS =====

model Mark {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId       String
  
  ocMark          Int?      // Organizer Contribution (0-10)
  successAdjustment Int     @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([userId, projectId])
  @@index([userId])
}

// ===== CERTIFICATES =====

model Certificate {
  id              String    @id @default(cuid())
  userId          String
  projectId       String
  
  certificateUrl  String
  qrCode          String
  
  issuedAt        DateTime  @default(now())
  
  @@index([userId])
  @@index([projectId])
}

// ===== COMPLAINTS =====

enum ComplaintStatus {
  OPEN
  INVESTIGATING
  RESOLVED
  DISMISSED
}

model Complaint {
  id              String    @id @default(cuid())
  filedBy         String
  filedByUser     User      @relation(fields: [filedBy], references: [id])
  
  description     String
  status          ComplaintStatus @default(OPEN)
  resolution      String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([filedBy])
  @@index([status])
}

// ===== AUDIT LOG =====

model AuditLog {
  id              String    @id @default(cuid())
  userId          String?
  action          String
  entity          String
  entityId        String
  changes         String?   // JSON of what changed
  
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

#### Run Initial Setup
```bash
# Generate Prisma client
npx prisma generate

# Create first migration
npx prisma migrate dev --name initial

# Inspect database
npx prisma studio  # Opens visual database editor
```

---

### Express App Setup (M0.5)

#### src/config/database.ts
```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
```

#### src/config/index.ts
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '8080'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '1h',
    refreshExpiresIn: '7d',
  },
  
  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Azure
  azure: {
    storageAccount: process.env.AZURE_STORAGE_ACCOUNT,
    storageKey: process.env.AZURE_STORAGE_KEY,
  },
};

// Validate required config
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

#### src/app.ts
```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@config';
import logger from '@utils/logger';
import { errorHandler } from '@middleware/errorHandler';
import routes from '@routes';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

#### src/server.ts
```typescript
import app from './app';
import { config } from '@config';
import logger from '@utils/logger';
import prisma from '@config/database';

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

---

### Authentication Service (M0.2)

#### src/utils/jwt.ts
```typescript
import jwt from 'jsonwebtoken';
import { config } from '@config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
};
```

#### src/services/authService.ts
```typescript
import prisma from '@config/database';
import { generateTokens, JWTPayload } from '@utils/jwt';
import { hashPassword, comparePassword } from '@utils/passwords';
import { AppError } from '@utils/errors';

export class AuthService {
  async register(email: string, phone: string, password: string, firstName: string, lastName: string) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: 'VOLUNTEER',
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
      include: { profile: true },
    });
    
    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    return { user, ...tokens };
  }
  
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }
    
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }
    
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    return { user, ...tokens };
  }
  
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = require('@utils/jwt').verifyRefreshToken(refreshToken);
      const tokens = generateTokens({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}

export default new AuthService();
```

---

### Testing Setup (Unit Tests)

#### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### src/tests/unit/auth.test.ts
```typescript
import { AuthService } from '@services/authService';
import prisma from '@config/database';

jest.mock('@config/database');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        phone: '+1234567890',
        role: 'VOLUNTEER',
        status: 'ACTIVE',
        profile: { firstName: 'Test', lastName: 'User' },
      };
      
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      
      const result = await AuthService.register(
        'test@example.com',
        '+1234567890',
        'password123',
        'Test',
        'User'
      );
      
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
    
    it('should throw error if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
      
      await expect(
        AuthService.register(
          'test@example.com',
          '+1234567890',
          'password123',
          'Test',
          'User'
        )
      ).rejects.toThrow('User already exists');
    });
  });
});
```

---

## 3. API DOCUMENTATION SETUP

### OpenAPI/Swagger Setup
```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express @types/swagger-jsdoc
```

#### src/utils/swagger.ts
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zero Plastic API',
      version: '1.0.0',
      description: 'Platform API for Zero Plastic Movement',
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: 'Development server',
      },
      {
        url: 'https://api.zeroplastic.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
```

#### In app.ts:
```typescript
import swaggerUi from 'swagger-ui-express';
import { specs } from '@utils/swagger';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 4. DEPLOYMENT SETUP (Phase 1 End)

### GitHub Actions CI/CD

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: pguser
          POSTGRES_PASSWORD: pgpass
          POSTGRES_DB: zero_plastic_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma client
        run: npx prisma generate
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://pguser:pgpass@localhost:5432/zero_plastic_test
      
      - name: Build
        run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: zero-plastic-api
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: .
```

---

## 5. MONITORING & LOGGING

### Winston Logger
```typescript
// src/utils/logger.ts
import winston from 'winston';
import { config } from '@config';

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Azure Application Insights (optional)
```typescript
import { ApplicationInsightsClient } from '@azure/monitor-opentelemetry';

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  const client = new ApplicationInsightsClient({
    connectionString: process.env.APPINSIGHTS_CONNECTION_STRING,
  });
}
```

---

## 6. SECURITY CHECKLIST

### Phase 1 Security Must-Haves
```
✅ HTTPS/TLS everywhere
✅ Environment variables for secrets (never in code)
✅ Password hashing with bcrypt
✅ JWT with proper expiry
✅ CORS configured
✅ Helmet.js for security headers
✅ Input validation (Joi)
✅ SQL injection prevention (Prisma ORM)
✅ Rate limiting on auth endpoints
✅ CSRF protection (for web app)
✅ Audit logging
✅ No console logs of sensitive data
```

---

## 7. PERFORMANCE CHECKLIST

### Phase 1 Targets
```
✅ API response time: <200ms (p95)
✅ Database query: <50ms (p95)
✅ /health endpoint: <50ms
✅ Memory usage: <500MB steady state
✅ CPU: <30% idle
✅ No N+1 queries
✅ Database connection pooling configured
✅ Caching headers set correctly
```

---

## READY TO START

### Week 1 Checklist
- [ ] GitHub repo created
- [ ] Azure resources provisioned
- [ ] Local PostgreSQL running (Docker)
- [ ] Node.js backend project initialized
- [ ] TypeScript configured
- [ ] Prisma schema drafted
- [ ] Database migrations working

### Week 2 Checklist
- [ ] Prisma schema complete (M0.1)
- [ ] Auth service implemented (M0.2)
- [ ] User service implemented (M0.3)
- [ ] Projects/Clubs service implemented (M0.4)
- [ ] Express routes working (M0.5)
- [ ] Unit tests >80% coverage
- [ ] Postman collection created
- [ ] Staging deployment working
- [ ] Ready for Phase 1 validation gate

---

**Your tech stack is solid. Your architecture is clear. You're ready to build.**

Start Monday with database design.

Follow the roadmap.

✅ Phase 1: Complete.

🚀
