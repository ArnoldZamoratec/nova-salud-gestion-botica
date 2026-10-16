import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(1, "El nombre del producto es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    price: z.coerce.number().min(0, "El precio debe ser un número positivo"),
    category: z.string().min(1, "La categoría es obligatoria"),
    stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
    min_stock: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo").default(10),
    requires_prescription: z.boolean(),
    has_strips: z.boolean(),
    strip_count: z.coerce.number().default(0),
    strips_per_box: z.coerce.number().default(0),
  })
  .superRefine((data, ctx) => {
    if (data.has_strips) {
      if (data.strips_per_box <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["strips_per_box"],
          message:
            "Los blísteres por caja deben ser mayores a 0 si el producto se vende por blíster",
        });
      }
      if (data.strip_count >= data.strips_per_box) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["strip_count"],
          message: `Los blísteres sueltos (${data.strip_count}) deben ser menos que los blísteres por caja (${data.strips_per_box})`,
        });
      }
    }
  });
