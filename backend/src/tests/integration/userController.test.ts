jest.mock('../../services/userService');

import request from 'supertest';
import app from '../../app';
import * as userService from '../../services/userService';
import { signAccessToken } from '../../utils/jwt';

const mockUserService = userService as jest.Mocked<typeof userService>;

const volunteerToken = signAccessToken({ sub: 'user-1', roles: [] });
const adminToken = signAccessToken({ sub: 'admin-1', roles: ['SUPER_ADMIN'] });

const sampleProfile = {
  id: 'user-1',
  email: 'volunteer@example.com',
  phone: null,
  status: 'ACTIVE' as const,
  profile: {
    name: 'Nish',
    bio: null,
    imageUrl: null,
    tier: 'ROOKIE' as const,
    achievements: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /users/me', () => {
  it('returns 401 without an access token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('returns 200 with the caller\'s own profile when authenticated', async () => {
    mockUserService.getProfile.mockResolvedValue(sampleProfile);

    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${volunteerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleProfile);
    expect(mockUserService.getProfile).toHaveBeenCalledWith('user-1');
  });
});

describe('PATCH /users/me', () => {
  it('returns 400 for an empty body', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(mockUserService.updateProfile).not.toHaveBeenCalled();
  });

  it('returns 200 and forwards the sanitized body on success', async () => {
    mockUserService.updateProfile.mockResolvedValue(sampleProfile);

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ name: 'Nish', unknownField: 'dropped' });

    expect(res.status).toBe(200);
    expect(mockUserService.updateProfile).toHaveBeenCalledWith('user-1', { name: 'Nish' });
  });
});

describe('POST /users/me/change-password', () => {
  it('returns 400 when the new password is too short', async () => {
    const res = await request(app)
      .post('/users/me/change-password')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ oldPassword: 'OldPassword1!', newPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('returns 204 on success', async () => {
    mockUserService.changePassword.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/users/me/change-password')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ oldPassword: 'OldPassword1!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(204);
  });
});

describe('admin-only routes', () => {
  it('rejects GET /users for a caller without an admin role', async () => {
    const res = await request(app).get('/users').set('Authorization', `Bearer ${volunteerToken}`);
    expect(res.status).toBe(403);
    expect(mockUserService.listUsers).not.toHaveBeenCalled();
  });

  it('allows GET /users for a caller with SUPER_ADMIN', async () => {
    mockUserService.listUsers.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });

    const res = await request(app).get('/users').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(mockUserService.listUsers).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, {});
  });

  it('rejects POST /users/:userId/suspend for a non-admin', async () => {
    const res = await request(app)
      .post('/users/user-2/suspend')
      .set('Authorization', `Bearer ${volunteerToken}`);
    expect(res.status).toBe(403);
  });

  it('allows POST /users/:userId/suspend for an admin', async () => {
    mockUserService.suspendUser.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/users/user-2/suspend')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(mockUserService.suspendUser).toHaveBeenCalledWith('user-2');
  });

  it('allows POST /users/:userId/activate for an admin', async () => {
    mockUserService.activateUser.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/users/user-2/activate')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(mockUserService.activateUser).toHaveBeenCalledWith('user-2');
  });

  it('allows GET /users/:userId for an admin', async () => {
    mockUserService.getProfile.mockResolvedValue(sampleProfile);

    const res = await request(app).get('/users/user-2').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(mockUserService.getProfile).toHaveBeenCalledWith('user-2');
  });

  it('allows GET /users/search for an admin', async () => {
    mockUserService.searchUsers.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });

    const res = await request(app)
      .get('/users/search')
      .query({ q: 'nish' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(mockUserService.searchUsers).toHaveBeenCalledWith('nish', { page: 1, pageSize: 20 });
  });

  it('rejects an invalid tier on PATCH /users/:userId/tier', async () => {
    const res = await request(app)
      .patch('/users/user-2/tier')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tier: 'NOT_A_TIER' });

    expect(res.status).toBe(400);
    expect(mockUserService.setTier).not.toHaveBeenCalled();
  });

  it('allows PATCH /users/:userId/tier for an admin', async () => {
    mockUserService.setTier.mockResolvedValue(undefined);

    const res = await request(app)
      .patch('/users/user-2/tier')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tier: 'CHAMPION' });

    expect(res.status).toBe(204);
    expect(mockUserService.setTier).toHaveBeenCalledWith('user-2', 'CHAMPION');
  });

  it('allows DELETE /users/:userId for an admin', async () => {
    mockUserService.deleteUser.mockResolvedValue(undefined);

    const res = await request(app).delete('/users/user-2').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-2');
  });
});
