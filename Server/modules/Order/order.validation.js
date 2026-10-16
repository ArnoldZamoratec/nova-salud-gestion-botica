import Joi from "joi";

export const CreateOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required().messages({
          "string.base": "El ID del producto debe ser texto",
          "string.hex": "El ID del producto debe ser hexadecimal válido",
          "string.length": "El ID del producto debe tener 24 caracteres",
          "any.required": "El ID del producto es obligatorio",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "La cantidad debe ser un número",
          "number.integer": "La cantidad debe ser un entero",
          "number.min": "La cantidad debe ser al menos 1",
          "any.required": "La cantidad es obligatoria",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Los productos deben ser una lista",
      "array.min": "El pedido debe contener al menos un producto",
      "any.required": "La lista de productos es obligatoria",
    }),
  address: Joi.object({
    street: Joi.string().trim().required().messages({
      "string.base": "La calle debe ser texto",
      "string.empty": "La calle es obligatoria",
      "any.required": "La calle es obligatoria",
    }),
    city: Joi.string().trim().required().messages({
      "string.base": "La ciudad debe ser texto",
      "string.empty": "La ciudad es obligatoria",
      "any.required": "La ciudad es obligatoria",
    }),
    postalCode: Joi.string().trim().allow("").optional().messages({
      "string.base": "El código postal debe ser texto",
    }),
    phone: Joi.string().trim().allow("").optional().messages({
      "string.base": "El teléfono debe ser texto",
    }),
  })
    .required()
    .messages({
      "any.required": "La dirección es obligatoria",
    }),
  paymentMethod: Joi.string()
    .valid("COD", "card")
    .default("COD")
    .optional()
    .messages({
      "any.only": "El método de pago debe ser contra entrega (COD) o tarjeta",
    }),
});

export const UpdateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "shipped", "delivered", "canceled")
    .required()
    .messages({
      "any.only":
        "El estado debe ser: pending, shipped, delivered o canceled",
      "any.required": "El estado es obligatorio",
    }),
});
