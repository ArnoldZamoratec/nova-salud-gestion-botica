import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewService } from "./review.service.js";
import { ReviewRepository } from "./review.repository.js";
import { ProductService } from "../Product/product.service.js";
import { UserService } from "../User/user.service.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../utils/errors.js";

vi.mock("./review.repository.js");
vi.mock("../Product/product.service.js");
vi.mock("../User/user.service.js");

describe("ReviewService", () => {
  const mockUserId = "user123";
  const mockAdminId = "admin123";
  const mockProductId = "prod123";
  const mockReviewId = "rev123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTopReviews", () => {
    it("devuelve las reseñas destacadas", async () => {
      const mockReviews = [{ _id: "1", rating: 5 }];
      ReviewRepository.findTopReviews.mockResolvedValue(mockReviews);

      const result = await ReviewService.getTopReviews();
      expect(result).toEqual(mockReviews);
      expect(ReviewRepository.findTopReviews).toHaveBeenCalled();
    });
  });

  describe("createReview", () => {
    it("lanza NotFoundError si el producto no existe o está inactivo", async () => {
      ProductService.findProductByIdAndActive.mockResolvedValue(null);

      await expect(
        ReviewService.createReview(mockUserId, mockProductId, 5, "Great"),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ConflictError si el usuario ya reseñó el producto", async () => {
      ProductService.findProductByIdAndActive.mockResolvedValue({
        is_active: true,
        is_deleted: false,
      });
      ReviewRepository.findReviewByUserAndProduct.mockResolvedValue({
        _id: "existing",
      });

      await expect(
        ReviewService.createReview(mockUserId, mockProductId, 5, "Great"),
      ).rejects.toThrow(ConflictError);
    });

    it("crea la reseña, actualiza la calificación del producto y devuelve la reseña poblada", async () => {
      ProductService.findProductByIdAndActive.mockResolvedValue({
        is_active: true,
        is_deleted: false,
      });
      ReviewRepository.findReviewByUserAndProduct.mockResolvedValue(null);

      const mockPopulatedReview = {
        _id: mockReviewId,
        product: mockProductId,
        rating: 4,
      };

      mockPopulatedReview.populate = vi
        .fn()
        .mockResolvedValue(mockPopulatedReview);

      ReviewRepository.createReview.mockResolvedValue(mockPopulatedReview);
      ReviewRepository.findAllReviewsByProduct.mockResolvedValue([
        { rating: 4 },
        { rating: 5 },
      ]);

      const result = await ReviewService.createReview(
        mockUserId,
        mockProductId,
        4,
        "Good",
      );

      expect(ReviewRepository.createReview).toHaveBeenCalledWith({
        product: mockProductId,
        user: mockUserId,
        rating: 4,
        comment: "Good",
      });
      expect(ProductService.updateProductStats).toHaveBeenCalledWith(
        mockProductId,
        4.5,
        2,
      );
      expect(mockPopulatedReview.populate).toHaveBeenCalledWith(
        "user",
        "name avatar",
      );
      expect(result._id).toBe(mockReviewId);
    });
  });

  describe("getAllReviews", () => {
    it("lanza BadRequestError si la paginación es inválida", async () => {
      await expect(ReviewService.getAllReviews({ page: -1 })).rejects.toThrow(
        BadRequestError,
      );
      await expect(ReviewService.getAllReviews({ limit: 150 })).rejects.toThrow(
        BadRequestError,
      );
    });

    it("aplica filtros por producto, usuario y calificación", async () => {
      ReviewRepository.countReviews.mockResolvedValue(10);
      ReviewRepository.findReviewsPaginated.mockResolvedValue([]);

      await ReviewService.getAllReviews({
        product: mockProductId,
        user: mockUserId,
        rating: 4,
      });

      expect(ReviewRepository.findReviewsPaginated).toHaveBeenCalledWith(
        { product: mockProductId, user: mockUserId, rating: 4 },
        0,
        10,
      );
    });

    it("maneja los filtros de búsqueda productName y userName", async () => {
      ReviewRepository.countReviews.mockResolvedValue(5);
      ReviewRepository.findReviewsPaginated.mockResolvedValue([]);

      ProductService.searchProductsIdsByName.mockResolvedValue([{ _id: "p1" }]);
      UserService.searchUsersIdsByName.mockResolvedValue([{ _id: "u1" }]);

      await ReviewService.getAllReviews({
        productName: "Panadol",
        userName: "Ahmed",
      });

      expect(ProductService.searchProductsIdsByName).toHaveBeenCalled();
      expect(UserService.searchUsersIdsByName).toHaveBeenCalled();
      expect(ReviewRepository.findReviewsPaginated).toHaveBeenCalledWith(
        { product: { $in: ["p1"] }, user: { $in: ["u1"] } },
        0,
        10,
      );
    });

    it("maneja la búsqueda general por palabra clave", async () => {
      ReviewRepository.countReviews.mockResolvedValue(2);
      ReviewRepository.findReviewsPaginated.mockResolvedValue([]);

      ProductService.searchProductsIdsByName.mockResolvedValue([{ _id: "p1" }]);
      UserService.searchUsersIdsByName.mockResolvedValue([{ _id: "u1" }]);

      await ReviewService.getAllReviews({ search: "Great" });

      expect(ReviewRepository.findReviewsPaginated).toHaveBeenCalledWith(
        {
          $or: [
            { comment: { $regex: "Great", $options: "i" } },
            { product: { $in: ["p1"] } },
            { user: { $in: ["u1"] } },
          ],
        },
        0,
        10,
      );
    });
  });

  describe("getOneReview", () => {
    it("lanza NotFoundError si no se encuentra la reseña", async () => {
      ReviewRepository.findReviewById.mockResolvedValue(null);
      await expect(ReviewService.getOneReview(mockReviewId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("devuelve la reseña si existe", async () => {
      ReviewRepository.findReviewById.mockResolvedValue({ _id: mockReviewId });
      const result = await ReviewService.getOneReview(mockReviewId);
      expect(result._id).toBe(mockReviewId);
    });
  });

  describe("updateReview", () => {
    it("lanza NotFoundError si la reseña no existe", async () => {
      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue(null);
      await expect(
        ReviewService.updateReview(mockReviewId, mockUserId, "user", {}),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ForbiddenError si el usuario no es el autor ni administrador", async () => {
      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue({
        _id: mockReviewId,
        user: "differentUser",
      });
      await expect(
        ReviewService.updateReview(mockReviewId, mockUserId, "user", {}),
      ).rejects.toThrow(ForbiddenError);
    });

    it("permite al autor actualizar calificación y comentario y actualiza las estadísticas del producto", async () => {
      const mockReview = {
        _id: mockReviewId,
        user: mockUserId,
        product: mockProductId,
        rating: 3,
        comment: "Old",
      };
      mockReview.populate = vi.fn().mockResolvedValue(mockReview);

      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue(mockReview);
      ReviewRepository.findAllReviewsByProduct.mockResolvedValue([
        { rating: 5 },
      ]);

      const result = await ReviewService.updateReview(
        mockReviewId,
        mockUserId,
        "user",
        { rating: 5, comment: "New", isTopReview: true },
      );

      expect(mockReview.rating).toBe(5);
      expect(mockReview.comment).toBe("New");
      expect(mockReview.isTopReview).toBeUndefined();
      expect(ReviewRepository.saveReview).toHaveBeenCalledWith(mockReview);
      expect(ProductService.updateProductStats).toHaveBeenCalledWith(
        mockProductId,
        5,
        1,
      );
      expect(mockReview.populate).toHaveBeenCalledTimes(2);
      expect(result.rating).toBe(5);
    });

    it("permite al administrador cambiar isTopReview pero no el comentario", async () => {
      const mockReview = {
        _id: mockReviewId,
        user: "differentUser",
        product: mockProductId,
        isTopReview: false,
      };

      mockReview.populate = vi.fn().mockResolvedValue(mockReview);

      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue(mockReview);
      ReviewRepository.findAllReviewsByProduct.mockResolvedValue([]);

      await ReviewService.updateReview(mockReviewId, mockAdminId, "admin", {
        comment: "Hacked",
        isTopReview: true,
      });

      expect(mockReview.comment).toBeUndefined();
      expect(mockReview.isTopReview).toBe(true);
    });
  });

  describe("deleteReview", () => {
    it("lanza NotFoundError si la reseña no existe", async () => {
      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue(null);
      await expect(
        ReviewService.deleteReview(mockReviewId, mockUserId, "user"),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ForbiddenError si no está autorizado", async () => {
      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue({
        _id: mockReviewId,
        user: "differentUser",
      });
      await expect(
        ReviewService.deleteReview(mockReviewId, mockUserId, "user"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("elimina la reseña y actualiza las estadísticas del producto (autor)", async () => {
      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue({
        _id: mockReviewId,
        user: mockUserId,
        product: mockProductId,
      });
      ReviewRepository.findAllReviewsByProduct.mockResolvedValue([]);

      await ReviewService.deleteReview(mockReviewId, mockUserId, "user");

      expect(ReviewRepository.deleteReviewById).toHaveBeenCalledWith(
        mockReviewId,
      );
      expect(ProductService.updateProductStats).toHaveBeenCalledWith(
        mockProductId,
        0,
        0,
      );
    });

    it("elimina la reseña y actualiza las estadísticas del producto (administrador)", async () => {
      ReviewRepository.findReviewByIdForUpdate.mockResolvedValue({
        _id: mockReviewId,
        user: "differentUser",
        product: mockProductId,
      });
      ReviewRepository.findAllReviewsByProduct.mockResolvedValue([]);

      await ReviewService.deleteReview(mockReviewId, mockAdminId, "admin");

      expect(ReviewRepository.deleteReviewById).toHaveBeenCalledWith(
        mockReviewId,
      );
    });
  });

  describe("getReviewsForProduct", () => {
    it("devuelve las reseñas de un producto", async () => {
      ReviewRepository.findAllReviewsByProduct.mockResolvedValue([
        { _id: "1" },
      ]);
      const result = await ReviewService.getReviewsForProduct(mockProductId);
      expect(result).toHaveLength(1);
      expect(ReviewRepository.findAllReviewsByProduct).toHaveBeenCalledWith(
        mockProductId,
      );
    });
  });
});
