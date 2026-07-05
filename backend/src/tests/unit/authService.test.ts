jest.mock('../../config/prisma', () => {
  const mockPrisma: Record<string, any> = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
    otpCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    userRole: {
      findMany: jest.fn(),
    },
  };
  // $transaction just runs the callback against the same mocked client.
  mockPrisma.$transaction = jest.fn((callback: (tx: unknown) => unknown) => callback(mockPrisma));
  return { prisma: mockPrisma };
});

jest.mock('../../utils/password', () => ({
  hashPassword: jest.fn(async (plain: string) => `hashed:${plain}`),
  verifyPassword: jest.fn(async () => true),
}));

jest.mock('../../utils/jwt', () => ({
  signAccessToken: jest.fn(() => 'access-token'),
  signRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn(() => ({ sub: 'user-1' })),
  hashToken: jest.fn((value: string) => `hash:${value}`),
}));

jest.mock('../../config/twilio', () => ({
  sendSms: jest.fn(async () => undefined),
}));

import { prisma } from '../../config/prisma';
import { verifyPassword } from '../../utils/password';
import { verifyRefreshToken } from '../../utils/jwt';
import { sendSms } from '../../config/twilio';
import * as authService from '../../services/authService';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../utils/errors';

const mockPrisma = prisma as unknown as {
  user: Record<string, jest.Mock>;
  profile: Record<string, jest.Mock>;
  otpCode: Record<string, jest.Mock>;
  refreshToken: Record<string, jest.Mock>;
  userRole: Record<string, jest.Mock>;
};

const baseUser = {
  id: 'user-1',
  email: 'volunteer@example.com',
  phone: null as string | null,
  passwordHash: 'hashed:Password123!',
  status: 'ACTIVE',
  failedLoginAttempts: 0,
  lockedUntil: null as Date | null,
  passwordChangedAt: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.userRole.findMany.mockResolvedValue([]);
  mockPrisma.refreshToken.create.mockResolvedValue({});
  mockPrisma.profile.create.mockResolvedValue({});
});

describe('registerWithPassword', () => {
  it('creates a new user and issues tokens when the email/phone is unused', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(baseUser);

    const result = await authService.registerWithPassword({
      email: 'volunteer@example.com',
      password: 'Password123!',
    });

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { email: 'volunteer@example.com', phone: undefined, passwordHash: 'hashed:Password123!' },
    });
    expect(result.user.id).toBe('user-1');
    expect(result.tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });

  it('throws ConflictError when the email or phone is already registered', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(baseUser);

    await expect(
      authService.registerWithPassword({ email: 'volunteer@example.com', password: 'Password123!' }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  it('returns tokens and resets failed attempts on success', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ ...baseUser, failedLoginAttempts: 2 });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await authService.login({ email: baseUser.email!, password: 'Password123!' });

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: baseUser.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: expect.any(Date) },
    });
    expect(result.tokens.accessToken).toBe('access-token');
  });

  it('throws UnauthorizedError when no user matches', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws TooManyRequestsError when the account is locked', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      ...baseUser,
      lockedUntil: new Date(Date.now() + 60_000),
    });

    await expect(
      authService.login({ email: baseUser.email!, password: 'Password123!' }),
    ).rejects.toBeInstanceOf(TooManyRequestsError);
  });

  it('increments failedLoginAttempts and throws UnauthorizedError on a wrong password', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(baseUser);
    (verifyPassword as jest.Mock).mockResolvedValueOnce(false);
    mockPrisma.user.update.mockResolvedValue({});

    await expect(
      authService.login({ email: baseUser.email!, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: baseUser.id },
      data: { failedLoginAttempts: 1, lockedUntil: undefined },
    });
  });

  it('throws ForbiddenError when the account is not ACTIVE', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ ...baseUser, status: 'SUSPENDED' });

    await expect(
      authService.login({ email: baseUser.email!, password: 'Password123!' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('requestOtp', () => {
  it('sends an SMS and stores a hashed OTP for REGISTRATION when the phone is new', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.otpCode.create.mockResolvedValue({});

    await authService.requestOtp({ phone: '+94771234567', purpose: 'REGISTRATION' });

    expect(mockPrisma.otpCode.create).toHaveBeenCalled();
    expect(sendSms).toHaveBeenCalledWith('+94771234567', expect.stringContaining('verification code'));
  });

  it('throws ConflictError for REGISTRATION when the phone already has an account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser);

    await expect(
      authService.requestOtp({ phone: '+94771234567', purpose: 'REGISTRATION' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws NotFoundError for LOGIN when no account exists for the phone', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.requestOtp({ phone: '+94771234567', purpose: 'LOGIN' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('verifyOtp', () => {
  const pendingOtp = {
    id: 'otp-1',
    phone: '+94771234567',
    purpose: 'REGISTRATION',
    codeHash: 'hash:123456',
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    createdAt: new Date(),
  };

  it('creates a user for a valid REGISTRATION code', async () => {
    mockPrisma.otpCode.findFirst.mockResolvedValue(pendingOtp);
    mockPrisma.otpCode.update.mockResolvedValue({});
    mockPrisma.user.create.mockResolvedValue({ ...baseUser, email: null, phone: '+94771234567' });

    const result = await authService.verifyOtp({
      phone: '+94771234567',
      code: '123456',
      purpose: 'REGISTRATION',
      password: 'Password123!',
    });

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { phone: '+94771234567', passwordHash: 'hashed:Password123!' },
    });
    expect(result.tokens.accessToken).toBe('access-token');
  });

  it('logs an existing user in for a valid LOGIN code', async () => {
    mockPrisma.otpCode.findFirst.mockResolvedValue({ ...pendingOtp, purpose: 'LOGIN' });
    mockPrisma.otpCode.update.mockResolvedValue({});
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, phone: '+94771234567' });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await authService.verifyOtp({
      phone: '+94771234567',
      code: '123456',
      purpose: 'LOGIN',
    });

    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    expect(result.user.id).toBe('user-1');
  });

  it('throws BadRequestError when there is no pending code', async () => {
    mockPrisma.otpCode.findFirst.mockResolvedValue(null);

    await expect(
      authService.verifyOtp({ phone: '+94771234567', code: '123456', purpose: 'REGISTRATION' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError when the code has expired', async () => {
    mockPrisma.otpCode.findFirst.mockResolvedValue({
      ...pendingOtp,
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(
      authService.verifyOtp({ phone: '+94771234567', code: '123456', purpose: 'REGISTRATION' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws TooManyRequestsError once attempts are exhausted', async () => {
    mockPrisma.otpCode.findFirst.mockResolvedValue({ ...pendingOtp, attempts: 5 });

    await expect(
      authService.verifyOtp({ phone: '+94771234567', code: '123456', purpose: 'REGISTRATION' }),
    ).rejects.toBeInstanceOf(TooManyRequestsError);
  });

  it('increments attempts and throws BadRequestError on an incorrect code', async () => {
    mockPrisma.otpCode.findFirst.mockResolvedValue(pendingOtp);
    mockPrisma.otpCode.update.mockResolvedValue({});

    await expect(
      authService.verifyOtp({ phone: '+94771234567', code: '000000', purpose: 'REGISTRATION' }),
    ).rejects.toBeInstanceOf(BadRequestError);

    expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
      where: { id: 'otp-1' },
      data: { attempts: 1 },
    });
  });
});

describe('refreshTokens', () => {
  const storedToken = {
    id: 'rt-1',
    userId: 'user-1',
    tokenHash: 'hash:some-refresh-token',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null as Date | null,
    createdAt: new Date(),
  };

  it('rotates a valid refresh token', async () => {
    mockPrisma.refreshToken.findUnique.mockResolvedValue(storedToken);
    mockPrisma.refreshToken.update.mockResolvedValue({});

    const tokens = await authService.refreshTokens('some-refresh-token');

    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(tokens.accessToken).toBe('access-token');
  });

  it('throws UnauthorizedError when the JWT itself fails verification', async () => {
    (verifyRefreshToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error('bad token');
    });

    await expect(authService.refreshTokens('garbage')).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError when the token is not found in the database', async () => {
    mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

    await expect(authService.refreshTokens('some-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError when the token was already revoked', async () => {
    mockPrisma.refreshToken.findUnique.mockResolvedValue({ ...storedToken, revokedAt: new Date() });

    await expect(authService.refreshTokens('some-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});

describe('logout', () => {
  it('revokes the matching, still-active refresh token', async () => {
    mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    await authService.logout('some-refresh-token');

    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { tokenHash: 'hash:some-refresh-token', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
