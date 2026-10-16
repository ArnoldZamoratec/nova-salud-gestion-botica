import mongoose from "mongoose";
import { CartRepository } from "./cart.repository.js";
import { ProductService } from "../Product/product.service.js";
import { BadRequestError } from "../../utils/errors.js";

export const CartService = {
  getUserCart: async (userId) => {
    let cart = await CartRepository.findCartAndPopulate(userId);

    if (!cart) {
      try {
        await CartRepository.createCart({
          user: userId,
          items: [],
          total_price: 0,
        });
        cart = await CartRepository.findCartAndPopulate(userId);
      } catch (error) {
        if (error.code === 11000) {
          cart = await CartRepository.findCartAndPopulate(userId);
        } else {
          throw error;
        }
      }
    }
    return cart;
  },

  addToCart: async (userId, productId, quantity, unit) => {
    const qty = quantity || 1;

    if (!["box", "strip"].includes(unit)) {
      throw new BadRequestError("Unidad inválida. Debe ser 'box' (caja) o 'strip' (blíster).");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await ProductService.getProductByIdForTransaction(
        productId,
        session,
      );
      if (!product) throw new BadRequestError("Producto no encontrado");

      let itemPrice = product.price;
      if (unit === "strip") {
        if (!product.has_strips || product.strips_per_box <= 0) {
          throw new BadRequestError("Este producto no se vende por blíster");
        }
        itemPrice = Number((product.price / product.strips_per_box).toFixed(2));
      }

      if (unit === "box" && product.stock < qty) {
        throw new BadRequestError("Stock insuficiente (cajas)");
      } else if (unit === "strip") {
        const totalStrips =
          product.strip_count + product.stock * product.strips_per_box;
        if (totalStrips < qty) {
          throw new BadRequestError("Stock insuficiente (blísteres)");
        }
      }

      let userCart = await CartRepository.findCartByUserId(userId, session);

      if (!userCart) {
        const newCartData = {
          user: userId,
          items: [
            { product: productId, quantity: qty, unit, price: itemPrice },
          ],
          total_price: qty * itemPrice,
        };
        userCart = await CartRepository.createCart(newCartData, session);
      } else {
        const existingItem = userCart.items.find(
          (it) => it.product.toString() === productId && it.unit === unit,
        );

        if (existingItem) {
          existingItem.quantity += qty;
        } else {
          userCart.items.push({
            product: productId,
            quantity: qty,
            unit,
            price: itemPrice,
          });
        }

        userCart.total_price = userCart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );

        await CartRepository.saveCart(userCart, session);
      }

      await session.commitTransaction();
      session.endSession();

      return await userCart.populate("items.product");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  removeFromCart: async (userId, productId, unit) => {
    const cart = await CartRepository.findCartByUserId(userId);
    if (!cart) throw new BadRequestError("Carrito no encontrado");

    const idx = cart.items.findIndex(
      (it) => it.product.toString() === productId && it.unit === unit,
    );
    if (idx === -1) throw new BadRequestError("Producto no encontrado en el carrito");

    cart.items.splice(idx, 1);
    cart.total_price = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    await CartRepository.saveCart(cart);
    return await cart.populate("items.product");
  },

  clearCart: async (userId, session = null) => {
    const cart = await CartRepository.findCartByUserId(userId, session);
    if (!cart) return; 

    cart.items = [];
    cart.total_price = 0;

    await CartRepository.saveCart(cart, session);
    return cart;
  },

  updateCartQuantity: async (userId, productId, quantity, unit) => {
    if (!quantity || quantity < 1) {
      throw new BadRequestError("La cantidad debe ser al menos 1");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = await CartRepository.findCartByUserId(userId, session);
      if (!cart) throw new BadRequestError("Carrito no encontrado");

      const existingItem = cart.items.find(
        (it) => it.product.toString() === productId && it.unit === unit,
      );
      if (!existingItem) throw new BadRequestError("Producto no encontrado en el carrito");

      const product = await ProductService.getProductByIdForTransaction(
        productId,
        session,
      );
      if (!product) throw new BadRequestError("Producto no encontrado");

      if (unit === "box" && product.stock < quantity) {
        throw new BadRequestError("Stock insuficiente (cajas)");
      } else if (unit === "strip") {
        const totalStrips =
          product.strip_count + product.stock * product.strips_per_box;
        if (totalStrips < quantity) {
          throw new BadRequestError("Stock insuficiente (blísteres)");
        }
      }

      existingItem.quantity = quantity;
      cart.total_price = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );

      await CartRepository.saveCart(cart, session);
      await session.commitTransaction();
      session.endSession();

      return await cart.populate("items.product");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
};
