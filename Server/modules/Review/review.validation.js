import Joi from "joi";

export const createReviewSchema = Joi.object({
  product: Joi.string().hex().length(24).required().messages({
    "string.base": "El ID del producto debe ser texto",
    "string.hex": "El ID del producto debe ser hexadecimal válido",
    "string.length": "El ID del producto debe tener exactamente 24 caracteres",
    "any.required": "El ID del producto es obligatorio",
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    "number.base": "La calificación debe ser un número",
    "number.min": "La calificación debe ser al menos 1",
    "number.max": "La calificación debe ser como máximo 5",
    "any.required": "La calificación es obligatoria",
  }),
  comment: Joi.string().trim().max(1000).optional().allow("").messages({
    "string.base": "El comentario debe ser texto",
    "string.max": "El comentario debe tener como máximo 1000 caracteres",
  }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional().messages({
    "number.base": "La calificación debe ser un número",
    "number.min": "La calificación debe ser al menos 1",
    "number.max": "La calificación debe ser como máximo 5",
  }),
  comment: Joi.string().trim().max(1000).optional().allow("").messages({
    "string.base": "El comentario debe ser texto",
    "string.max": "El comentario debe tener como máximo 1000 caracteres",
  }),
  isTopReview: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "Debe enviarse al menos un campo para actualizar",
  });
