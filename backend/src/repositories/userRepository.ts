import { Prisma, UserStatus, UserTier } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface ListUsersFilters {
  status?: UserStatus;
  tier?: UserTier;
}

const NOT_DELETED: Prisma.UserWhereInput = { deletedAt: null };

export async function findUserWithProfile(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, ...NOT_DELETED },
    include: { profile: { include: { achievements: { include: { achievement: true } } } } },
  });
}

export async function findUserById(userId: string) {
  return prisma.user.findFirst({ where: { id: userId, ...NOT_DELETED } });
}

export async function updateProfile(
  userId: string,
  data: { name?: string; bio?: string; imageUrl?: string },
) {
  return prisma.profile.update({ where: { userId }, data });
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash, passwordChangedAt: new Date() },
  });
}

export async function updateStatus(userId: string, status: UserStatus) {
  return prisma.user.update({ where: { id: userId }, data: { status } });
}

export async function updateTier(userId: string, tier: UserTier) {
  return prisma.profile.update({ where: { userId }, data: { tier } });
}

export async function softDeleteUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), status: 'SUSPENDED' },
  });
}

export async function listUsers(pagination: Pagination, filters: ListUsersFilters) {
  const where: Prisma.UserWhereInput = {
    ...NOT_DELETED,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.tier ? { profile: { tier: filters.tier } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export async function searchUsers(query: string, pagination: Pagination) {
  const where: Prisma.UserWhereInput = {
    ...NOT_DELETED,
    OR: [
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } },
      { profile: { name: { contains: query, mode: 'insensitive' } } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}
