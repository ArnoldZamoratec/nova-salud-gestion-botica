import Joi from "joi";

export const CreateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    "string.base": "El nombre debe ser texto",
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 1 carácter",
    "string.max": "El nombre debe tener como máximo 200 caracteres",
    "any.required": "El nombre es obligatorio",
  }),

  description: Joi.string().min(5).max(1000).required().messages({
    "string.base": "La descripción debe ser texto",
    "string.empty": "La descripción es obligatoria",
    "string.min": "La descripción debe tener al menos 5 caracteres",
    "string.max": "La descripción debe tener como máximo 1000 caracteres",
    "any.required": "La descripción es obligatoria",
  }),

  price: Joi.number().min(0).required().messages({
    "number.base": "El precio debe ser un número",
    "number.min": "El precio no puede ser negativo",
    "any.required": "El precio es obligatorio",
  }),

  category: Joi.string().hex().length(24).required(),

  stock: Joi.number().min(0).required().messages({
    "number.base": "El stock debe ser un número",
    "number.min": "El stock no puede ser negativo",
    "any.required": "El stock es obligatorio",
  }),

  requires_prescription: Joi.boolean().empty("").default(false).messages({
    "boolean.base": "requires_prescription debe ser verdadero o falso",
  }),

  has_strips: Joi.boolean().empty("").default(false).messages({
    "boolean.base": "has_strips debe ser verdadero o falso",
  }),

  strip_count: Joi.number().empty("").optional().min(0).default(0).messages({
    "number.base": "strip_count debe ser un número",
    "number.min": "strip_count no puede ser negativo",
  }),

  strips_per_box: Joi.number().empty("").optional().min(0).default(0).messages({
    "number.base": "Los blísteres por caja deben ser un número",
    "number.min": "Los blísteres por caja no pueden ser negativos",
  }),

  min_stock: Joi.number().integer().empty("").min(0).default(10).messages({
    "number.base": "El stock mínimo debe ser un número",
    "number.integer": "El stock mínimo debe ser un entero",
    "number.min": "El stock mínimo no puede ser negativo",
  }),

  is_active: Joi.boolean().empty("").default(true).messages({
    "boolean.base": "is_active must be true or false",
  }),
});

export const UpdateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).messages({
    "string.base": "El nombre debe ser texto",
    "string.empty": "El nombre no puede estar vacío",
    "string.min": "El nombre debe tener al menos 1 carácter",
    "string.max": "El nombre debe tener como máximo 200 caracteres",
  }),

  description: Joi.string().min(5).max(1000).messages({
    "string.base": "La descripción debe ser texto",
    "string.empty": "La descripción no puede estar vacía",
    "string.min": "La descripción debe tener al menos 5 caracteres",
    "string.max": "La descripción debe tener como máximo 1000 caracteres",
  }),

  price: Joi.number().empty("").min(0).messages({
    "number.base": "El precio debe ser un número",
    "number.min": "El precio no puede ser negativo",
  }),

  category: Joi.string().hex().length(24),

  stock: Joi.number().empty("").min(0).messages({
    "number.base": "El stock debe ser un número",
    "number.min": "El stock no puede ser negativo",
  }),

  min_stock: Joi.number().integer().empty("").min(0).messages({
    "number.base": "El stock mínimo debe ser un número",
    "number.integer": "El stock mínimo debe ser un entero",
    "number.min": "El stock mínimo no puede ser negativo",
  }),

  requires_prescription: Joi.boolean().empty("").messages({
    "boolean.base": "requires_prescription debe ser verdadero o falso",
  }),

  has_strips: Joi.boolean().empty("").messages({
    "boolean.base": "has_strips debe ser verdadero o falso",
  }),

  strip_count: Joi.number().empty("").min(0).messages({
    "number.base": "strip_count debe ser un número",
    "number.min": "strip_count no puede ser negativo",
  }),

  strips_per_box: Joi.number().empty("").min(0).messages({
    "number.base": "Los blísteres por caja deben ser un número",
    "number.min": "Los blísteres por caja no pueden ser negativos",
  }),

  is_active: Joi.boolean().empty("").messages({
    "boolean.base": "is_active must be true or false",
  }),
})
  .min(1)
  .messages({
    "object.min": "Debe enviarse al menos un campo para actualizar",
  });
