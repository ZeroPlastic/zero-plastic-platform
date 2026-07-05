import { UserStatus, UserTier } from '@prisma/client';
import * as userRepository from '../repositories/userRepository';
import { hashPassword, verifyPassword } from '../utils/password';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface UserProfileDto {
  id: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  profile: {
    name: string | null;
    bio: string | null;
    imageUrl: string | null;
    tier: UserTier;
    achievements: Array<{ key: string; name: string; description: string | null; earnedAt: Date }>;
  } | null;
}

export interface UserSummaryDto {
  id: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  name: string | null;
  tier: UserTier | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

type UserWithProfile = NonNullable<Awaited<ReturnType<typeof userRepository.findUserWithProfile>>>;
type UserWithBasicProfile = Awaited<ReturnType<typeof userRepository.listUsers>>['items'][number];

function toProfileDto(user: UserWithProfile): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    status: user.status,
    profile: user.profile
      ? {
          name: user.profile.name,
          bio: user.profile.bio,
          imageUrl: user.profile.imageUrl,
          tier: user.profile.tier,
          achievements: user.profile.achievements.map((entry) => ({
            key: entry.achievement.key,
            name: entry.achievement.name,
            description: entry.achievement.description,
            earnedAt: entry.earnedAt,
          })),
        }
      : null,
  };
}

function toSummaryDto(user: UserWithBasicProfile): UserSummaryDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    status: user.status,
    name: user.profile?.name ?? null,
    tier: user.profile?.tier ?? null,
  };
}

export async function getProfile(userId: string): Promise<UserProfileDto> {
  const user = await userRepository.findUserWithProfile(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toProfileDto(user);
}

export async function updateProfile(
  userId: string,
  input: { name?: string; bio?: string; imageUrl?: string },
): Promise<UserProfileDto> {
  const existing = await userRepository.findUserById(userId);
  if (!existing) {
    throw new NotFoundError('User not found');
  }

  await userRepository.updateProfile(userId, input);
  return getProfile(userId);
}

export async function changePassword(
  userId: string,
  input: { oldPassword: string; newPassword: string },
): Promise<void> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const valid = await verifyPassword(input.oldPassword, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  if (input.oldPassword === input.newPassword) {
    throw new BadRequestError('New password must be different from the current password');
  }

  const passwordHash = await hashPassword(input.newPassword);
  await userRepository.updatePasswordHash(userId, passwordHash);
  logger.info(`Password changed for user ${userId}`);
}

export async function listUsers(
  pagination: { page: number; pageSize: number },
  filters: { status?: UserStatus; tier?: UserTier },
): Promise<PagedResult<UserSummaryDto>> {
  const { items, total } = await userRepository.listUsers(pagination, filters);
  return {
    items: items.map(toSummaryDto),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export async function searchUsers(
  query: string,
  pagination: { page: number; pageSize: number },
): Promise<PagedResult<UserSummaryDto>> {
  const { items, total } = await userRepository.searchUsers(query, pagination);
  return {
    items: items.map(toSummaryDto),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export async function suspendUser(userId: string): Promise<void> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await userRepository.updateStatus(userId, 'SUSPENDED');
  logger.info(`User suspended: ${userId}`);
}

export async function activateUser(userId: string): Promise<void> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await userRepository.updateStatus(userId, 'ACTIVE');
  logger.info(`User activated: ${userId}`);
}

/**
 * Manual for now. Automatic progression needs real points/activity data,
 * which doesn't exist yet — that belongs with the future Projects/Attendance module.
 */
export async function setTier(userId: string, tier: UserTier): Promise<void> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await userRepository.updateTier(userId, tier);
  logger.info(`Tier for user ${userId} set to ${tier}`);
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await userRepository.softDeleteUser(userId);
  logger.info(`User soft-deleted: ${userId}`);
}
