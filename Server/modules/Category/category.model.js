import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
      lowercase: true,
      maxlength: [50, "El nombre de la categoría debe tener como máximo 50 caracteres"],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "La descripción debe tener como máximo 500 caracteres"],
    },
    image: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

categorySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } },
);

categorySchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } },
);

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
