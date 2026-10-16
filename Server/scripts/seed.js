// Carga datos iniciales: super administrador, categorías y productos de ejemplo.
// Uso: npm run seed   (es idempotente: puede ejecutarse varias veces sin duplicar datos)
import mongoose from "mongoose";
import slugify from "slugify";
import dbconnect from "../config/mongo.js";
import User from "../modules/User/user.model.js";
import { Category } from "../modules/Category/category.model.js";
import Product from "../modules/Product/product.model.js";
import { hashPassword } from "../services/password.service.js";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@novasalud.pe";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "NovaSalud@2026";

// Imagen de referencia servida por el frontend (Web/public/icon.png)
const IMAGEN = "/icon.png";

const CATEGORIAS = [
  { name: "Analgésicos", description: "Medicamentos para aliviar el dolor y la fiebre." },
  { name: "Resfriado y gripe", description: "Antigripales, antitusivos y descongestionantes." },
  { name: "Cuidado de la diabetes", description: "Antidiabéticos orales, glucómetros y tiras reactivas." },
  { name: "Primeros auxilios", description: "Curitas, gasas, alcohol y antisépticos." },
  { name: "Vitaminas y suplementos", description: "Multivitamínicos, vitamina C y suplementos nutricionales." },
];

const PRODUCTOS = [
  { name: "Paracetamol 500 mg", top_selling: true, categoria: "Analgésicos", price: 0.5, stock: 120, min_stock: 30, has_strips: true, strips_per_box: 10, description: "Analgésico y antipirético. Caja x 10 blísteres de 10 tabletas." },
  { name: "Ibuprofeno 400 mg", categoria: "Analgésicos", price: 0.8, stock: 8, min_stock: 20, has_strips: true, strips_per_box: 10, description: "Antiinflamatorio no esteroideo para dolor e inflamación." },
  { name: "Naproxeno 550 mg", categoria: "Analgésicos", price: 1.2, stock: 40, min_stock: 15, description: "Antiinflamatorio para dolores musculares y articulares." },
  { name: "Panadol Antigripal", top_selling: true, categoria: "Resfriado y gripe", price: 1.5, stock: 60, min_stock: 20, description: "Alivia los síntomas de la gripe y el resfrío común." },
  { name: "Jarabe para la tos 120 ml", categoria: "Resfriado y gripe", price: 18.9, stock: 5, min_stock: 10, description: "Jarabe expectorante para la tos con flema." },
  { name: "Metformina 850 mg", categoria: "Cuidado de la diabetes", price: 0.6, stock: 90, min_stock: 30, requires_prescription: true, description: "Antidiabético oral. Venta con receta médica." },
  { name: "Tiras reactivas de glucosa x 50", categoria: "Cuidado de la diabetes", price: 65, stock: 12, min_stock: 5, description: "Tiras para medición de glucosa en sangre." },
  { name: "Amoxicilina 500 mg", categoria: "Primeros auxilios", price: 1, stock: 50, min_stock: 20, requires_prescription: true, description: "Antibiótico de amplio espectro. Venta con receta médica." },
  { name: "Alcohol medicinal 70° 250 ml", top_selling: true, categoria: "Primeros auxilios", price: 6.5, stock: 70, min_stock: 15, description: "Antiséptico para limpieza de heridas y superficies." },
  { name: "Vitamina C 1000 mg x 10", top_selling: true, categoria: "Vitaminas y suplementos", price: 12, stock: 35, min_stock: 10, description: "Tabletas efervescentes de vitamina C." },
];

const run = async () => {
  await dbconnect();

  const adminExiste = await User.findOne({ email: ADMIN_EMAIL });
  if (adminExiste) {
    console.log(`• Super administrador ya existe: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: "Administrador Nova Salud",
      email: ADMIN_EMAIL,
      password: await hashPassword(ADMIN_PASSWORD),
      role: "super_admin",
    });
    console.log(`✔ Super administrador creado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  const categoriasPorNombre = {};
  for (const cat of CATEGORIAS) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      {
        $setOnInsert: {
          ...cat,
          slug: slugify(cat.name, { lower: true, strict: true, trim: true }),
          image: IMAGEN,
        },
      },
      { upsert: true, new: true },
    );
    categoriasPorNombre[cat.name] = doc._id;
  }
  console.log(`✔ Categorías listas: ${CATEGORIAS.length}`);

  for (const { categoria, ...prod } of PRODUCTOS) {
    await Product.findOneAndUpdate(
      { name: prod.name },
      { $setOnInsert: { ...prod, category: categoriasPorNombre[categoria], image: IMAGEN } },
      { upsert: true, new: true },
    );
  }
  console.log(`✔ Productos listos: ${PRODUCTOS.length} (algunos con stock bajo para probar las alertas)`);
};

run()
  .catch((err) => {
    console.error("✖ Error al cargar los datos iniciales:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
