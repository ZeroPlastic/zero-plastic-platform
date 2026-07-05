jest.mock('../../config/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    profile: {
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../../config/prisma';
import * as userRepository from '../../repositories/userRepository';

const mockPrisma = prisma as unknown as {
  user: Record<string, jest.Mock>;
  profile: Record<string, jest.Mock>;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('findUserWithProfile', () => {
  it('queries for a non-deleted user and includes profile + achievements', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });

    await userRepository.findUserWithProfile('user-1');

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
      include: { profile: { include: { achievements: { include: { achievement: true } } } } },
    });
  });
});

describe('findUserById', () => {
  it('excludes soft-deleted users', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });

    await userRepository.findUserById('user-1');

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
    });
  });
});

describe('updateProfile', () => {
  it('updates the profile row by userId', async () => {
    mockPrisma.profile.update.mockResolvedValue({});

    await userRepository.updateProfile('user-1', { name: 'New Name' });

    expect(mockPrisma.profile.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { name: 'New Name' },
    });
  });
});

describe('updatePasswordHash', () => {
  it('sets the new hash and stamps passwordChangedAt', async () => {
    mockPrisma.user.update.mockResolvedValue({});

    await userRepository.updatePasswordHash('user-1', 'hashed:new');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'hashed:new', passwordChangedAt: expect.any(Date) },
    });
  });
});

describe('updateStatus', () => {
  it('updates the user status', async () => {
    mockPrisma.user.update.mockResolvedValue({});

    await userRepository.updateStatus('user-1', 'SUSPENDED');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { status: 'SUSPENDED' },
    });
  });
});

describe('softDeleteUser', () => {
  it('stamps deletedAt and forces status to SUSPENDED', async () => {
    mockPrisma.user.update.mockResolvedValue({});

    await userRepository.softDeleteUser('user-1');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { deletedAt: expect.any(Date), status: 'SUSPENDED' },
    });
  });
});

describe('listUsers', () => {
  it('applies status and tier filters, paginates, and returns a total count', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);
    mockPrisma.user.count.mockResolvedValue(1);

    const result = await userRepository.listUsers(
      { page: 2, pageSize: 10 },
      { status: 'ACTIVE', tier: 'HERO' },
    );

    const expectedWhere = { deletedAt: null, status: 'ACTIVE', profile: { tier: 'HERO' } };
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(result).toEqual({ items: [{ id: 'user-1' }], total: 1 });
  });

  it('omits filters that were not provided', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.count.mockResolvedValue(0);

    await userRepository.listUsers({ page: 1, pageSize: 20 }, {});

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    );
  });
});

describe('searchUsers', () => {
  it('searches across email, phone, and profile name', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.count.mockResolvedValue(0);

    await userRepository.searchUsers('nish', { page: 1, pageSize: 20 });

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          OR: [
            { email: { contains: 'nish', mode: 'insensitive' } },
            { phone: { contains: 'nish', mode: 'insensitive' } },
            { profile: { name: { contains: 'nish', mode: 'insensitive' } } },
          ],
        },
      }),
    );
  });
});
