import Joi, { ObjectSchema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from './errors';

const phone = Joi.string().pattern(/^\+?[1-9]\d{7,14}$/);
const password = Joi.string().min(8).max(72);
const otpCode = Joi.string().length(6).pattern(/^\d+$/);
const purpose = Joi.string().valid('REGISTRATION', 'LOGIN');

export const registerSchema: ObjectSchema = Joi.object({
  email: Joi.string().email(),
  phone,
  password: password.required(),
})
  .or('email', 'phone')
  .messages({ 'object.missing': 'Either email or phone is required' });

export const loginSchema: ObjectSchema = Joi.object({
  email: Joi.string().email(),
  phone,
  password: Joi.string().required(),
})
  .or('email', 'phone')
  .messages({ 'object.missing': 'Either email or phone is required' });

export const otpRequestSchema: ObjectSchema = Joi.object({
  phone: phone.required(),
  purpose: purpose.required(),
});

export const otpVerifySchema: ObjectSchema = Joi.object({
  phone: phone.required(),
  code: otpCode.required(),
  purpose: purpose.required(),
  password: password.when('purpose', { is: 'REGISTRATION', then: Joi.required(), otherwise: Joi.forbidden() }),
});

export const refreshSchema: ObjectSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export function validateBody(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(new BadRequestError(error.details.map((d) => d.message).join('; ')));
      return;
    }

    req.body = value;
    next();
  };
}

export function validateQuery(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(new BadRequestError(error.details.map((d) => d.message).join('; ')));
      return;
    }

    req.query = value;
    next();
  };
}
