import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import { CartService } from "./cart.service.js";
import { CartRepository } from "./cart.repository.js";
import { ProductService } from "../Product/product.service.js";
import { BadRequestError } from "../../utils/errors.js";


vi.mock("./cart.repository.js");
vi.mock("../Product/product.service.js");

describe("CartService", () => {
  const mockUserId = "user123";
  const mockProductId = "prod456";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(mongoose, "startSession").mockResolvedValue({
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    });
  });

  describe("getUserCart", () => {
    it("devuelve el carrito existente", async () => {
      const fakeCart = { user: mockUserId, items: [] };
      CartRepository.findCartAndPopulate.mockResolvedValue(fakeCart);

      const result = await CartService.getUserCart(mockUserId);

      expect(result).toEqual(fakeCart);
      expect(CartRepository.findCartAndPopulate).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it("crea un carrito nuevo si no existe", async () => {
      CartRepository.findCartAndPopulate
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ user: mockUserId, items: [] });
      CartRepository.createCart.mockResolvedValue(true);

      const result = await CartService.getUserCart(mockUserId);

      expect(CartRepository.createCart).toHaveBeenCalled();
      expect(result.user).toBe(mockUserId);
    });
  });

  describe("addToCart", () => {
    const fakeProduct = {
      _id: mockProductId,
      price: 100,
      stock: 10,
      has_strips: true,
      strips_per_box: 3,
      strip_count: 5,
    };

    it("lanza BadRequestError si la unidad es inválida", async () => {
      await expect(
        CartService.addToCart(mockUserId, mockProductId, 1, "invalid_unit"),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza BadRequestError si el producto no existe", async () => {
      ProductService.getProductByIdForTransaction.mockResolvedValue(null);

      await expect(
        CartService.addToCart(mockUserId, mockProductId, 1, "box"),
      ).rejects.toThrow(BadRequestError);
    });

    it("agrega un producto nuevo al carrito existente y confirma la transacción", async () => {
      ProductService.getProductByIdForTransaction.mockResolvedValue(
        fakeProduct,
      );

      const fakeCart = {
        user: mockUserId,
        items: [],
        total_price: 0,
        populate: vi.fn().mockResolvedValue(true),
      };
      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);

      await CartService.addToCart(mockUserId, mockProductId, 2, "box");

      expect(fakeCart.items.length).toBe(1);
      expect(fakeCart.items[0].quantity).toBe(2);
      expect(fakeCart.total_price).toBe(200);
      expect(CartRepository.saveCart).toHaveBeenCalled();
    });

    it("actualiza la cantidad si el producto ya está en el carrito", async () => {
      ProductService.getProductByIdForTransaction.mockResolvedValue(
        fakeProduct,
      );

      const fakeCart = {
        user: mockUserId,
        items: [
          { product: mockProductId, unit: "box", quantity: 1, price: 100 },
        ],
        total_price: 100,
        populate: vi.fn().mockResolvedValue(true),
      };
      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);

      await CartService.addToCart(mockUserId, mockProductId, 2, "box");

      expect(fakeCart.items[0].quantity).toBe(3);
      expect(fakeCart.total_price).toBe(300);
    });
  });

  describe("removeFromCart", () => {
    it("quita el producto y actualiza total_price", async () => {
      const fakeCart = {
        user: mockUserId,
        items: [
          { product: mockProductId, unit: "box", quantity: 2, price: 100 },
          { product: "prod789", unit: "strip", quantity: 1, price: 50 },
        ],
        total_price: 250,
        populate: vi.fn().mockResolvedValue(true),
      };

      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);

      await CartService.removeFromCart(mockUserId, mockProductId, "box");

      expect(fakeCart.items.length).toBe(1);
      expect(fakeCart.items[0].product).toBe("prod789");
      expect(fakeCart.total_price).toBe(50);
    });

    it("lanza error si el producto no está en el carrito", async () => {
      const fakeCart = {
        user: mockUserId,
        items: [{ product: "prod999", unit: "box", quantity: 1, price: 100 }],
      };
      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);

      await expect(
        CartService.removeFromCart(mockUserId, mockProductId, "box"),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("clearCart", () => {
    it("vacía todos los productos y reinicia total_price", async () => {
      const fakeCart = {
        user: mockUserId,
        items: [{ product: mockProductId, quantity: 1, price: 100 }],
        total_price: 100,
      };
      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);

      await CartService.clearCart(mockUserId);

      expect(fakeCart.items.length).toBe(0);
      expect(fakeCart.total_price).toBe(0);
      expect(CartRepository.saveCart).toHaveBeenCalled();
    });
  });

  describe("updateCartQuantity", () => {
    const fakeProduct = {
      _id: mockProductId,
      price: 100,
      stock: 10,
      strip_count: 5,
      strips_per_box: 3,
    };

    it("lanza error si la cantidad es menor a 1", async () => {
      await expect(
        CartService.updateCartQuantity(mockUserId, mockProductId, 0, "box"),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza error si no hay stock suficiente", async () => {
      const fakeCart = {
        user: mockUserId,
        items: [
          { product: mockProductId, unit: "box", quantity: 1, price: 100 },
        ],
      };
      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);
      ProductService.getProductByIdForTransaction.mockResolvedValue(
        fakeProduct,
      );

      await expect(
        CartService.updateCartQuantity(mockUserId, mockProductId, 20, "box"),
      ).rejects.toThrow(BadRequestError);
    });

    it("actualiza la cantidad correctamente", async () => {
      const fakeCart = {
        user: mockUserId,
        items: [
          { product: mockProductId, unit: "box", quantity: 1, price: 100 },
        ],
        total_price: 100,
        populate: vi.fn().mockResolvedValue(true),
      };
      CartRepository.findCartByUserId.mockResolvedValue(fakeCart);
      ProductService.getProductByIdForTransaction.mockResolvedValue(
        fakeProduct,
      );

      await CartService.updateCartQuantity(mockUserId, mockProductId, 5, "box");

      expect(fakeCart.items[0].quantity).toBe(5);
      expect(fakeCart.total_price).toBe(500);
      expect(CartRepository.saveCart).toHaveBeenCalled();
    });
  });
});
