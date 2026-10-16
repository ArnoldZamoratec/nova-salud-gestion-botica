import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "./product.service.js";
import { ProductRepository } from "./product.repository.js";
import { CategoryService } from "../Category/category.service.js";
import { ReviewService } from "../Review/review.service.js";
import { NotificationService } from "../Notification/notification.service.js";
import { getEmbedding } from "../../services/embedding.service.js";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

vi.mock("./product.repository.js");
vi.mock("../Category/category.service.js");
vi.mock("../Review/review.service.js");
vi.mock("../Notification/notification.service.js");
vi.mock("../../services/embedding.service.js");

vi.mock("../../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

vi.mock("streamifier", () => ({
  default: {
    createReadStream: vi.fn(),
  },
}));

describe("ProductService", () => {
  const mockFile = { buffer: Buffer.from("test") };
  const mockProductId = "prod123";
  const mockUserId = "user123";

  beforeEach(() => {
    vi.clearAllMocks();
    NotificationService.checkAndNotifyLowStock.mockResolvedValue();

    cloudinary.uploader.upload_stream.mockImplementation((options, cb) => {
      cb(null, { secure_url: "https://cloudinary.com/test.webp" });
      return { end: vi.fn() };
    });

    streamifier.createReadStream.mockReturnValue({
      pipe: vi.fn(),
    });
  });

  describe("createProduct", () => {
    it("lanza error si falta el archivo", async () => {
      await expect(
        ProductService.createProduct({ name: "Test", category: "cat1" }, null),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza error si falta la categoría", async () => {
      await expect(
        ProductService.createProduct({ name: "Test" }, mockFile),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza error si los blísteres son inconsistentes (stripsPerBox <= 0)", async () => {
      CategoryService.getCategoryById.mockResolvedValue({ name: "Meds" });
      const body = {
        name: "Test",
        category: "cat1",
        has_strips: true,
        strips_per_box: 0,
      };

      await expect(
        ProductService.createProduct(body, mockFile),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza error si los blísteres son inconsistentes (stripCount >= stripsPerBox)", async () => {
      CategoryService.getCategoryById.mockResolvedValue({ name: "Meds" });
      const body = {
        name: "Test",
        category: "cat1",
        has_strips: true,
        strips_per_box: 3,
        strip_count: 5,
      };

      await expect(
        ProductService.createProduct(body, mockFile),
      ).rejects.toThrow(BadRequestError);
    });

    it("formatea los datos, sube la imagen, genera embeddings y crea el producto", async () => {
      CategoryService.getCategoryById.mockResolvedValue({ name: "Meds" });
      getEmbedding.mockResolvedValue([0.1, 0.2]);
      ProductRepository.createProduct.mockResolvedValue({ _id: mockProductId });

      const body = {
        name: "Test Med",
        category: "cat1",
        description: "Test Desc",
        has_strips: "true",
        strip_count: "1",
        strips_per_box: "3",
        price: "100",
        requires_prescription: "true",
      };

      const result = await ProductService.createProduct(body, mockFile);

      expect(getEmbedding).toHaveBeenCalledWith(
        "Product: Test Med. Category: Meds. Description: Test Desc",
      );
      expect(ProductRepository.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          image: "https://cloudinary.com/test.webp",
          embeddings: [0.1, 0.2],
          price: 100,
          requires_prescription: true,
          strip_count: 1,
          strips_per_box: 3,
        }),
      );
      expect(NotificationService.checkAndNotifyLowStock).toHaveBeenCalled();
      expect(result._id).toBe(mockProductId);
    });
  });

  describe("getAllProducts", () => {
    it("lanza error si la página o el límite son inválidos", async () => {
      await expect(ProductService.getAllProducts({ page: -1 })).rejects.toThrow(
        BadRequestError,
      );
      await expect(
        ProductService.getAllProducts({ limit: 200 }),
      ).rejects.toThrow(BadRequestError);
    });

    it("devuelve paginación vacía si categoryName no existe", async () => {
      CategoryService.getCategoryByNameOrSlug.mockResolvedValue(null);

      const result = await ProductService.getAllProducts({
        categoryName: "NonExistent",
      });

      expect(result.products).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(ProductRepository.findProductsPaginated).not.toHaveBeenCalled();
    });

    it("aplica los filtros y devuelve productos paginados", async () => {
      ProductRepository.findProductsPaginated.mockResolvedValue([
        { _id: mockProductId },
      ]);
      ProductRepository.countProducts.mockResolvedValue(25);
      CategoryService.getCategoryByNameOrSlug.mockResolvedValue({
        _id: "cat123",
      });

      const queryParams = {
        page: 2,
        limit: 10,
        search: "Panadol",
        top_selling: "true",
        is_active: "true",
        categoryName: "Meds",
        minPrice: "10",
        maxPrice: "100",
        requires_prescription: "false",
        has_strips: "true",
        inStock: "true",
        minRating: "4",
      };

      const result = await ProductService.getAllProducts(queryParams);

      expect(ProductRepository.findProductsPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: false,
          is_active: true,
          top_selling: true,
          category: "cat123",
          requires_prescription: false,
          has_strips: true,
          stock: { $gt: 0 },
          rating: { $gte: 4 },
        }),
        10,
        10,
        { createdAt: -1 },
      );
      expect(result.pagination).toEqual({
        totalItems: 25,
        totalPages: 3,
        currentPage: 2,
        limit: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });

  describe("getOneProduct", () => {
    it("lanza NotFoundError si el producto no existe", async () => {
      ProductRepository.findProductById.mockResolvedValue(null);
      await expect(ProductService.getOneProduct(mockProductId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("devuelve el producto con sus reseñas", async () => {
      const mockProduct = { _id: mockProductId };
      ProductRepository.findProductById.mockResolvedValue(mockProduct);
      ReviewService.getReviewsForProduct.mockResolvedValue([{ rating: 5 }]);

      const result = await ProductService.getOneProduct(mockProductId);

      expect(result.reviews).toHaveLength(1);
    });
  });

  describe("deleteProduct", () => {
    it("lanza error si el producto no existe", async () => {
      ProductRepository.softDeleteProduct.mockResolvedValue(null);
      await expect(ProductService.deleteProduct(mockProductId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("elimina el producto correctamente", async () => {
      ProductRepository.softDeleteProduct.mockResolvedValue(true);
      await ProductService.deleteProduct(mockProductId);
      expect(ProductRepository.softDeleteProduct).toHaveBeenCalledWith(
        mockProductId,
      );
    });
  });

  describe("updateProduct", () => {
    it("lanza error si no hay datos ni archivo para actualizar", async () => {
      await expect(
        ProductService.updateProduct(mockProductId, {}, null),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza error si el producto no existe al actualizar", async () => {
      ProductRepository.updateProduct.mockResolvedValue(null);
      await expect(
        ProductService.updateProduct(mockProductId, { name: "New Name" }, null),
      ).rejects.toThrow(NotFoundError);
    });

    it("actualiza embeddings, formatea los datos y notifica stock bajo", async () => {
      const existingProduct = {
        _id: mockProductId,
        name: "Old Name",
        description: "Old Desc",
        category: { name: "Old Cat" },
        populate: vi.fn().mockResolvedValue(true),
      };

      ProductRepository.findProductByIdForUpdate.mockResolvedValue(
        existingProduct,
      );
      getEmbedding.mockResolvedValue([0.3, 0.4]);
      ProductRepository.updateProduct.mockResolvedValue({
        _id: mockProductId,
        stock: 2,
      });

      await ProductService.updateProduct(
        mockProductId,
        { name: "New Name", price: "50", requires_prescription: "false" },
        mockFile,
      );

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(getEmbedding).toHaveBeenCalledWith(
        "Product: New Name. Category: Old Cat. Description: Old Desc",
      );
      expect(ProductRepository.updateProduct).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          name: "New Name",
          price: 50,
          requires_prescription: false,
          embeddings: [0.3, 0.4],
          image: "https://cloudinary.com/test.webp",
        }),
      );
      expect(NotificationService.checkAndNotifyLowStock).toHaveBeenCalled();
    });
  });

  describe("Productos guardados", () => {
    it("getSavedProducts excluye los productos eliminados", async () => {
      ProductRepository.findSavedProductsByUser.mockResolvedValue([
        { product: { _id: "1", is_deleted: false } },
        { product: { _id: "2", is_deleted: true } },
        { product: null },
      ]);

      const result = await ProductService.getSavedProducts(mockUserId);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe("1");
    });

    it("toggleSavedProduct lanza error si el producto no existe", async () => {
      ProductRepository.findProductByIdForUpdate.mockResolvedValue(null);
      await expect(
        ProductService.toggleSavedProduct(mockUserId, mockProductId),
      ).rejects.toThrow(NotFoundError);
    });

    it("toggleSavedProduct quita el producto si ya estaba guardado", async () => {
      ProductRepository.findProductByIdForUpdate.mockResolvedValue(true);
      ProductRepository.findSavedProduct.mockResolvedValue({ _id: "save123" });

      const result = await ProductService.toggleSavedProduct(
        mockUserId,
        mockProductId,
      );

      expect(ProductRepository.deleteSavedProduct).toHaveBeenCalledWith(
        "save123",
      );
      expect(ProductRepository.incrementSaveCount).toHaveBeenCalledWith(
        mockProductId,
        -1,
      );
      expect(result.isSaved).toBe(false);
    });

    it("toggleSavedProduct guarda el producto si no estaba guardado", async () => {
      ProductRepository.findProductByIdForUpdate.mockResolvedValue(true);
      ProductRepository.findSavedProduct.mockResolvedValue(null);

      const result = await ProductService.toggleSavedProduct(
        mockUserId,
        mockProductId,
      );

      expect(ProductRepository.createSavedProduct).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
      );
      expect(ProductRepository.incrementSaveCount).toHaveBeenCalledWith(
        mockProductId,
        1,
      );
      expect(result.isSaved).toBe(true);
    });
  });

  describe("Métodos de paso directo", () => {
    it("llama correctamente a los métodos del repositorio", async () => {
      ProductService.findProductByIdAndActive(mockProductId);
      expect(ProductRepository.findProductByIdForUpdate).toHaveBeenCalledWith(
        mockProductId,
      );

      ProductService.updateProductStats(mockProductId, 4.5, 10);
      expect(ProductRepository.updateProduct).toHaveBeenCalledWith(
        mockProductId,
        {
          rating: 4.5,
          num_reviews: 10,
        },
      );

      ProductService.searchProductsIdsByName("test");
      expect(ProductRepository.findMatchingProducts).toHaveBeenCalledWith(
        "test",
      );

      ProductService.getProductByIdForTransaction(mockProductId, {});
      expect(
        ProductRepository.getProductByIdForTransaction,
      ).toHaveBeenCalledWith(mockProductId, {});

      ProductService.countProducts({ is_active: true });
      expect(ProductRepository.countProducts).toHaveBeenCalledWith({
        is_active: true,
      });

      ProductService.getProductsByIds([mockProductId], "name");
      expect(ProductRepository.findProductsByIds).toHaveBeenCalledWith(
        [mockProductId],
        "name",
      );

      ProductService.getActiveProducts("name");
      expect(ProductRepository.findActiveProducts).toHaveBeenCalledWith("name");

      ProductService.updateProductStock(mockProductId, -1, {});
      expect(ProductRepository.updateProductStock).toHaveBeenCalledWith(
        mockProductId,
        -1,
        {},
      );

      ProductService.searchProductsForChat("test");
      expect(ProductRepository.searchByWordsForChat).toHaveBeenCalledWith(
        "test",
      );

      ProductService.getTopRecommendedProducts();
      expect(ProductRepository.findTopRecommendedForChat).toHaveBeenCalled();
    });
  });
});
