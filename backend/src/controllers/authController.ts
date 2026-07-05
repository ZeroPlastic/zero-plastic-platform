import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

export const register = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  const result = await authService.registerWithPassword({ email, phone, password });
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  const result = await authService.login({ email, phone, password });
  res.status(200).json(result);
});

export const requestOtp = asyncHandler(async (req, res) => {
  const { phone, purpose } = req.body;
  await authService.requestOtp({ phone, purpose });
  res.status(202).json({ message: 'Verification code sent' });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code, purpose, password } = req.body;
  const result = await authService.verifyOtp({ phone, code, purpose, password });
  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  res.status(200).json(tokens);
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});
