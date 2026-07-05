import crypto from 'crypto';
import { OtpPurpose, User } from '@prisma/client';
import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt';
import { sendSms } from '../config/twilio';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../utils/errors';
import { logger } from '../utils/logger';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;
const REFRESH_TOKEN_TTL_DAYS = 30;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string | null;
  phone: string | null;
  status: string;
}

function toSafeUser(user: User): SafeUser {
  return { id: user.id, email: user.email, phone: user.phone, status: user.status };
}

function addMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  return crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, '0');
}

async function issueTokens(userId: string): Promise<AuthTokens> {
  const assignments = await prisma.userRole.findMany({
    where: { userId, endedAt: null, deletedAt: null },
    include: { role: true },
  });
  const roles = assignments.map((assignment) => assignment.role.key);

  const accessToken = signAccessToken({ sub: userId, roles });
  const refreshToken = signRefreshToken({ sub: userId });

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: addDays(REFRESH_TOKEN_TTL_DAYS),
    },
  });

  return { accessToken, refreshToken };
}

async function handleFailedLogin(userId: string, currentAttempts: number): Promise<void> {
  const attempts = currentAttempts + 1;
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: attempts,
      lockedUntil: attempts >= MAX_FAILED_LOGINS ? addMinutes(LOCKOUT_MINUTES) : undefined,
    },
  });
}

export async function registerWithPassword(input: {
  email?: string;
  phone?: string;
  password: string;
}): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const { email, phone, password } = input;

  const orConditions: Array<{ email: string } | { phone: string }> = [];
  if (email) orConditions.push({ email });
  if (phone) orConditions.push({ phone });

  const existing = await prisma.user.findFirst({ where: { OR: orConditions } });
  if (existing) {
    throw new ConflictError('An account with this email or phone already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, phone, passwordHash } });

  logger.info(`User registered via email/password: ${user.id}`);
  const tokens = await issueTokens(user.id);
  return { user: toSafeUser(user), tokens };
}

export async function login(input: {
  email?: string;
  phone?: string;
  password: string;
}): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const { email, phone, password } = input;

  const user = await prisma.user.findFirst({
    where: email ? { email } : { phone },
  });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new TooManyRequestsError('Account temporarily locked due to repeated failed logins');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await handleFailedLogin(user.id, user.failedLoginAttempts);
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.status !== 'ACTIVE') {
    throw new ForbiddenError('Account is not active');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const tokens = await issueTokens(user.id);
  return { user: toSafeUser(user), tokens };
}

export async function requestOtp(input: { phone: string; purpose: OtpPurpose }): Promise<void> {
  const { phone, purpose } = input;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (purpose === 'REGISTRATION' && existing) {
    throw new ConflictError('An account with this phone already exists');
  }
  if (purpose === 'LOGIN' && !existing) {
    throw new NotFoundError('No account found for this phone number');
  }

  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      phone,
      purpose,
      codeHash: hashToken(code),
      expiresAt: addMinutes(OTP_TTL_MINUTES),
    },
  });

  await sendSms(
    phone,
    `Your Zero Plastic verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  );
}

export async function verifyOtp(input: {
  phone: string;
  code: string;
  purpose: OtpPurpose;
  password?: string;
}): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const { phone, code, purpose, password } = input;

  const otp = await prisma.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    throw new BadRequestError('No pending verification code for this phone number');
  }
  if (otp.expiresAt < new Date()) {
    throw new BadRequestError('Verification code has expired');
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw new TooManyRequestsError('Too many incorrect attempts — request a new code');
  }

  if (otp.codeHash !== hashToken(code)) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } });
    throw new BadRequestError('Incorrect verification code');
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  if (purpose === 'REGISTRATION') {
    if (!password) {
      throw new BadRequestError('Password is required to complete registration');
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { phone, passwordHash } });
    logger.info(`User registered via phone OTP: ${user.id}`);
    const tokens = await issueTokens(user.id);
    return { user: toSafeUser(user), tokens };
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    throw new NotFoundError('No account found for this phone number');
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const tokens = await issueTokens(user.id);
  return { user: toSafeUser(user), tokens };
}

export async function refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  return issueTokens(payload.sub);
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
