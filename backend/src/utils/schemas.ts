import Joi, { ObjectSchema } from 'joi';

const TIERS = ['ROOKIE', 'CONTRIBUTOR', 'HERO', 'CHAMPION'];
const STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'];

export const updateProfileSchema: ObjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120),
  bio: Joi.string().trim().max(1000).allow(''),
  imageUrl: Joi.string().uri().max(2048),
}).min(1);

export const changePasswordSchema: ObjectSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(72).required(),
});

export const listUsersQuerySchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...STATUSES),
  tier: Joi.string().valid(...TIERS),
});

export const searchUsersQuerySchema: ObjectSchema = Joi.object({
  q: Joi.string().trim().min(1).max(200).required(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

export const updateTierSchema: ObjectSchema = Joi.object({
  tier: Joi.string()
    .valid(...TIERS)
    .required(),
});
