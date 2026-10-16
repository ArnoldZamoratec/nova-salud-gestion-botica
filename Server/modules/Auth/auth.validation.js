import Joi from "joi";
import { ROLES, DEFAULT_ROLE } from "../../utils/constants.js";

const strongPassword = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .required()
  .messages({
    "string.min": "La contraseña debe tener al menos 8 caracteres",
    "string.max": "La contraseña debe tener como máximo 128 caracteres",
    "string.pattern.base":
      "La contraseña debe contener mayúscula, minúscula, número y un carácter especial (@$!%*?&)",
    "string.empty": "La contraseña es obligatoria",
    "any.required": "La contraseña es obligatoria",
  });

// Registro
export const RegisterSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim().required().messages({
    "string.base": "El nombre debe ser texto",
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 3 caracteres",
    "string.max": "El nombre debe tener como máximo 100 caracteres",
    "any.required": "El nombre es obligatorio",
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "El correo debe ser válido",
    "string.empty": "El correo es obligatorio",
    "any.required": "El correo es obligatorio",
  }),

  password: strongPassword,

  role: Joi.string()
    .valid(...ROLES)
    .default(DEFAULT_ROLE)
    .messages({
      "any.only": `El rol debe ser uno de: ${ROLES.join(", ")}`,
      "string.base": "El rol debe ser texto",
    }),
});

// Inicio de sesión 
export const LoginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.empty": "El correo es obligatorio",
    "string.email": "Ingresa un correo válido",
    "any.required": "El correo es obligatorio",
  }),

  password: Joi.string().min(8).max(128).required().messages({
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 8 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
});
