import { Request, Response, NextFunction } from 'express';
import { UserStatus, UserTier } from '@prisma/client';
import * as userService from '../services/userService';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

// req.user is always set here — every route using this reaches the handler
// only after the `authenticate` middleware, which sets it or short-circuits with 401.
function requireUserId(req: Request): string {
  return req.user!.sub;
}

export const getMe = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(requireUserId(req));
  res.status(200).json(profile);
});

export const getUserById = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.params.userId);
  res.status(200).json(profile);
});

export const updateMe = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(requireUserId(req), req.body);
  res.status(200).json(profile);
});

export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(requireUserId(req), req.body);
  res.status(204).send();
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, pageSize, status, tier } = req.query as unknown as {
    page: number;
    pageSize: number;
    status?: UserStatus;
    tier?: UserTier;
  };
  const result = await userService.listUsers({ page, pageSize }, { status, tier });
  res.status(200).json(result);
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q, page, pageSize } = req.query as unknown as { q: string; page: number; pageSize: number };
  const result = await userService.searchUsers(q, { page, pageSize });
  res.status(200).json(result);
});

export const suspendUser = asyncHandler(async (req, res) => {
  await userService.suspendUser(req.params.userId);
  res.status(204).send();
});

export const activateUser = asyncHandler(async (req, res) => {
  await userService.activateUser(req.params.userId);
  res.status(204).send();
});

export const setTier = asyncHandler(async (req, res) => {
  await userService.setTier(req.params.userId, req.body.tier);
  res.status(204).send();
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.userId);
  res.status(204).send();
});
