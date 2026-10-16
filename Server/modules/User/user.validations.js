import Joi from "joi";
import { ROLES } from "../../utils/constants.js";

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre debe tener menos de 50 caracteres",
    "string.base": "El nombre debe ser texto",
  }),

  date_of_birth: Joi.date().max("now").iso().messages({
    "date.base": "La fecha de nacimiento debe ser válida",
    "date.max": "La fecha de nacimiento no puede ser futura",
    "date.format": "La fecha de nacimiento debe tener formato ISO (AAAA-MM-DD)",
  }),

  gender: Joi.string().valid("male", "female").messages({
    "any.only": "El género debe ser male (masculino) o female (femenino)",
    "string.base": "El género debe ser texto",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      "string.pattern.base": "El teléfono debe ser un número válido (9 a 15 dígitos)",
      "string.base": "El teléfono debe ser texto",
    }),

  email: Joi.string().email().optional(),

  address: Joi.object({
    label: Joi.string().trim().max(50).messages({
      "string.max": "La etiqueta de dirección debe tener menos de 50 caracteres",
      "string.base": "La etiqueta de dirección debe ser texto",
    }),
    city: Joi.string().trim().max(50).messages({
      "string.max": "La ciudad debe tener menos de 50 caracteres",
      "string.base": "La ciudad debe ser texto",
    }),
    street: Joi.string().trim().max(100).messages({
      "string.max": "La calle debe tener menos de 100 caracteres",
      "string.base": "La calle debe ser texto",
    }),
  }).messages({
    "object.base": "La dirección debe ser un objeto",
  }),
})
  .min(1)
  .messages({
    "object.min": "Debe enviarse al menos un campo",
  });

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),

  email: Joi.string().email().lowercase().trim().required(),

  password: Joi.string().min(8).required().messages({
    "string.min": "La contraseña debe tener al menos 8 caracteres",
  }),

  role: Joi.string()
    .valid(...ROLES)
    .required()
    .messages({
      "any.only": "Rol inválido",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/),
});

export const toggleActiveSchema = Joi.object({
  is_active: Joi.boolean().required(),
});
