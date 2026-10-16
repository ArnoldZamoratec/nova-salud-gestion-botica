import Joi from "joi";

const nameField = Joi.string()
  .trim()
  .min(3)
  .max(50)
  .pattern(/^[a-zA-Z\s]+$/)
  .invalid(...Array.from({ length: 10 }, (_, i) => String(i)))
  .messages({
    "string.base": "El nombre debe ser texto",
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 3 caracteres",
    "string.max": "El nombre debe tener como máximo 50 caracteres",
    "string.pattern.base":
      "El nombre solo puede contener letras y espacios, sin números",
    "any.required": "El nombre es obligatorio",
    "any.invalid": "El nombre debe ser una palabra, no un número",
  });

const descriptionField = Joi.string().trim().max(500).allow("").messages({
  "string.base": "La descripción debe ser texto",
  "string.max": "La descripción debe tener como máximo 500 caracteres",
});

export const createCategorySchema = Joi.object({
  name: nameField.required(),
  description: descriptionField.optional(),
});

export const updateCategorySchema = Joi.object({
  name: nameField.optional(),
  description: descriptionField.optional(),
})
  .min(1)
  .messages({
    "object.min": "Debe enviarse al menos un campo",
  });
