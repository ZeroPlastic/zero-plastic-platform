jest.mock('../../repositories/userRepository');
jest.mock('../../utils/password', () => ({
  hashPassword: jest.fn(async (plain: string) => `hashed:${plain}`),
  verifyPassword: jest.fn(async () => true),
}));

import * as userRepository from '../../repositories/userRepository';
import { verifyPassword } from '../../utils/password';
import * as userService from '../../services/userService';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors';

const mockRepo = userRepository as jest.Mocked<typeof userRepository>;

const baseUser = {
  id: 'user-1',
  email: 'volunteer@example.com',
  phone: null as string | null,
  passwordHash: 'hashed:OldPassword1!',
  status: 'ACTIVE' as const,
  failedLoginAttempts: 0,
  lockedUntil: null,
  passwordChangedAt: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const userWithProfile = {
  ...baseUser,
  profile: {
    id: 'profile-1',
    userId: 'user-1',
    name: 'Nish',
    bio: 'Beach cleanup enthusiast',
    imageUrl: null,
    tier: 'ROOKIE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    achievements: [
      {
        profileId: 'profile-1',
        achievementId: 'ach-1',
        earnedAt: new Date('2026-01-01'),
        achievement: {
          id: 'ach-1',
          key: 'first_cleanup',
          name: 'First Cleanup',
          description: 'Completed your first project',
          createdAt: new Date(),
        },
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getProfile', () => {
  it('returns a profile DTO including achievements', async () => {
    mockRepo.findUserWithProfile.mockResolvedValue(userWithProfile as never);

    const result = await userService.getProfile('user-1');

    expect(result.profile?.achievements).toEqual([
      { key: 'first_cleanup', name: 'First Cleanup', description: 'Completed your first project', earnedAt: userWithProfile.profile.achievements[0].earnedAt },
    ]);
  });

  it('throws NotFoundError when the user does not exist', async () => {
    mockRepo.findUserWithProfile.mockResolvedValue(null);

    await expect(userService.getProfile('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('updateProfile', () => {
  it('updates and returns the refreshed profile', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    mockRepo.updateProfile.mockResolvedValue({} as never);
    mockRepo.findUserWithProfile.mockResolvedValue(userWithProfile as never);

    const result = await userService.updateProfile('user-1', { name: 'New Name' });

    expect(mockRepo.updateProfile).toHaveBeenCalledWith('user-1', { name: 'New Name' });
    expect(result.id).toBe('user-1');
  });

  it('throws NotFoundError when the user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(userService.updateProfile('missing', { name: 'X' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(mockRepo.updateProfile).not.toHaveBeenCalled();
  });
});

describe('changePassword', () => {
  it('hashes and stores the new password on success', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    mockRepo.updatePasswordHash.mockResolvedValue({} as never);

    await userService.changePassword('user-1', {
      oldPassword: 'OldPassword1!',
      newPassword: 'NewPassword1!',
    });

    expect(mockRepo.updatePasswordHash).toHaveBeenCalledWith('user-1', 'hashed:NewPassword1!');
  });

  it('throws NotFoundError when the user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(
      userService.changePassword('missing', { oldPassword: 'a', newPassword: 'b12345678' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws UnauthorizedError when the old password is wrong', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    (verifyPassword as jest.Mock).mockResolvedValueOnce(false);

    await expect(
      userService.changePassword('user-1', { oldPassword: 'wrong', newPassword: 'NewPassword1!' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mockRepo.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('throws BadRequestError when the new password matches the old one', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);

    await expect(
      userService.changePassword('user-1', { oldPassword: 'SamePassword1!', newPassword: 'SamePassword1!' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('listUsers', () => {
  it('maps repository rows into summary DTOs with pagination metadata', async () => {
    mockRepo.listUsers.mockResolvedValue({
      items: [{ ...baseUser, profile: { name: 'Nish', tier: 'ROOKIE' } }] as never,
      total: 1,
    });

    const result = await userService.listUsers({ page: 1, pageSize: 20 }, {});

    expect(result).toEqual({
      items: [
        {
          id: 'user-1',
          email: 'volunteer@example.com',
          phone: null,
          status: 'ACTIVE',
          name: 'Nish',
          tier: 'ROOKIE',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
  });
});

describe('searchUsers', () => {
  it('maps repository rows into summary DTOs', async () => {
    mockRepo.searchUsers.mockResolvedValue({
      items: [{ ...baseUser, profile: null }] as never,
      total: 1,
    });

    const result = await userService.searchUsers('nish', { page: 1, pageSize: 20 });

    expect(result.items[0]).toEqual({
      id: 'user-1',
      email: 'volunteer@example.com',
      phone: null,
      status: 'ACTIVE',
      name: null,
      tier: null,
    });
  });
});

describe('suspendUser / activateUser', () => {
  it('suspends an existing user', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    mockRepo.updateStatus.mockResolvedValue({} as never);

    await userService.suspendUser('user-1');

    expect(mockRepo.updateStatus).toHaveBeenCalledWith('user-1', 'SUSPENDED');
  });

  it('activates an existing user', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    mockRepo.updateStatus.mockResolvedValue({} as never);

    await userService.activateUser('user-1');

    expect(mockRepo.updateStatus).toHaveBeenCalledWith('user-1', 'ACTIVE');
  });

  it('throws NotFoundError for a missing user on suspend', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(userService.suspendUser('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('setTier', () => {
  it('updates the tier for an existing user', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    mockRepo.updateTier.mockResolvedValue({} as never);

    await userService.setTier('user-1', 'CHAMPION');

    expect(mockRepo.updateTier).toHaveBeenCalledWith('user-1', 'CHAMPION');
  });

  it('throws NotFoundError for a missing user', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(userService.setTier('missing', 'CHAMPION')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('deleteUser', () => {
  it('soft-deletes an existing user', async () => {
    mockRepo.findUserById.mockResolvedValue(baseUser as never);
    mockRepo.softDeleteUser.mockResolvedValue({} as never);

    await userService.deleteUser('user-1');

    expect(mockRepo.softDeleteUser).toHaveBeenCalledWith('user-1');
  });

  it('throws NotFoundError for a missing user', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(userService.deleteUser('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
