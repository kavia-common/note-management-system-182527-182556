import Joi from 'joi';

export const noteCreateSchema = Joi.object({
  title: Joi.string().allow('').required(),
  content: Joi.string().allow('').required(),
  pinned: Joi.boolean().optional()
});

export const noteUpdateSchema = Joi.object({
  title: Joi.string().allow(''),
  content: Joi.string().allow(''),
  pinned: Joi.boolean()
}).min(1);

export const paginationSchema = Joi.object({
  q: Joi.string().allow(''),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(500).default(100),
  pinned: Joi.string().valid('true', 'false')
});
