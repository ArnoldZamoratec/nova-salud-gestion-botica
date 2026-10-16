import { CartService } from "../modules/Cart/cart.service.js";
import { OrderService } from "../modules/Order/order.service.js";
import { ProductService } from "../modules/Product/product.service.js";

const UNIDADES = { box: "caja", strip: "blíster" };

const ESTADOS = {
  pending: "Pendiente",
  shipped: "Enviado",
  delivered: "Entregado",
  canceled: "Cancelado",
};

// Quita tildes para que "medicación" y "medicacion" coincidan
const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const getDbContext = async (userId, userMessage) => {
  let dbContext = "";
  const messageLower = normalizar(userMessage);

  // 1. Carrito del usuario
  const cartKeywords = ["carrito", "canasta", "mis productos", "cart"];
  if (cartKeywords.some((keyword) => messageLower.includes(keyword))) {
    try {
      const cart = await CartService.getUserCart(userId);

      if (cart && cart.items && cart.items.length > 0) {
        dbContext += `\n[Productos en el carrito del usuario]:\n`;

        cart.items.forEach((item, index) => {
          if (item.product) {
            dbContext += `${index + 1}. Producto: ${item.product.name}, Cantidad: ${item.quantity}, Precio: S/ ${item.price} por ${UNIDADES[item.unit] || "caja"}\n`;
          }
        });

        dbContext += `Total del carrito: S/ ${cart.total_price}\n`;
      } else {
        dbContext += `\n[Carrito del usuario]: El carrito está vacío.\n`;
      }
    } catch (err) {
      console.error("Error al obtener el carrito para el chatbot:", err);
    }
  }

  // 2. Pedidos del usuario
  const orderKeywords = [
    "pedido",
    "orden",
    "compra",
    "delivery",
    "envio",
    "enviado",
    "entregado",
    "entrega",
    "seguimiento",
  ];
  if (orderKeywords.some((keyword) => messageLower.includes(keyword))) {
    try {
      const allOrders = await OrderService.getUserOrders(userId);
      const orders = allOrders.slice(0, 3);

      if (orders && orders.length > 0) {
        dbContext += `\n[Pedidos recientes del usuario]:\n`;
        orders.forEach((order, index) => {
          dbContext += `Pedido #${index + 1} (ID: ${order._id}):\n`;
          dbContext += `  Estado: ${ESTADOS[order.status] || order.status}\n`;
          dbContext += `  Total: S/ ${order.total}\n`;
          dbContext += `  Dirección: ${order.address?.street || "N/D"}, ${order.address?.city || "N/D"}\n`;
          dbContext += `  Fecha: ${new Date(order.createdAt).toLocaleDateString("es-PE")}\n`;
          dbContext += `  Productos:\n`;
          order.items.forEach((item) => {
            if (item.product) {
              dbContext += `    - ${item.product.name} (Cant.: ${item.quantity}, Precio: S/ ${item.price})\n`;
            }
          });
        });
      } else {
        dbContext += `\n[Pedidos del usuario]: El usuario aún no tiene pedidos.\n`;
      }
    } catch (err) {
      console.error("Error al obtener los pedidos para el chatbot:", err);
    }
  }

  // 3. Búsqueda de productos
  const productKeywords = [
    "tienen",
    "tienes",
    "hay",
    "comprar",
    "precio",
    "cuesta",
    "cuanto",
    "buscar",
    "busco",
    "medicamento",
    "medicina",
    "remedio",
    "pastilla",
    "tableta",
    "capsula",
    "jarabe",
    "tratamiento",
    "dolor",
    "resfrio",
    "gripe",
    "tos",
    "fiebre",
    "diabet",
    "presion",
    "cabeza",
    "alergia",
  ];
  const seemsLikeProductQuery =
    productKeywords.some((keyword) => messageLower.includes(keyword)) ||
    userMessage.split(/\s+/).length < 5;

  if (seemsLikeProductQuery) {
    try {
      const cleanWords = userMessage
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);

      let products = [];

      if (cleanWords.length > 0) {
        products = await ProductService.searchProductsForChat(cleanWords);
      }

      if (products.length === 0) {
        products = await ProductService.getTopRecommendedProducts();
      }

      if (products && products.length > 0) {
        dbContext += `\n[Productos disponibles en la botica / Resultados de búsqueda]:\n`;
        products.forEach((prod, index) => {
          dbContext += `${index + 1}. Nombre: ${prod.name}\n`;
          dbContext += `   Categoría: ${prod.category ? prod.category.name : "General"}\n`;
          dbContext += `   Precio: S/ ${prod.price}\n`;
          dbContext += `   Descripción: ${prod.description}\n`;
          dbContext += `   Stock: ${prod.stock > 0 ? `Disponible (${prod.stock})` : "Agotado"}\n`;
          dbContext += `   Requiere receta: ${prod.requires_prescription ? "Sí" : "No"}\n`;
        });
      }
    } catch (err) {
      console.error("Error al buscar productos para el chatbot:", err);
    }
  }

  return dbContext;
};
